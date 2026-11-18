// Python visualiser: runs real Python in the browser (Pyodide) and records
// every line as it runs, so each step shows exactly what happened.

(function () {
  const MAX_STEPS = 1000;

  const EXAMPLES = [
    {
      name: "Loop through a list",
      code: `prices = [3, 12, 7]
total = 0
for price in prices:
    if price > 5:
        total = total + price
print("Total of the big ones:", total)`,
    },
    {
      name: "Add two numbers",
      code: `x = 5
y = 10
total = x + y
print(f"The sum is {total}")`,
    },
    {
      name: "A function that calls itself",
      code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

answer = factorial(4)
print(answer)`,
    },
    {
      name: "Count words",
      code: `text = "the cat sat on the mat"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)`,
    },
    {
      name: "A while loop",
      code: `n = 6
steps = 0
while n != 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = 3 * n + 1
    steps += 1
print(n, "after", steps, "steps")`,
    },
  ];

  // Runs inside Pyodide. Records a step after each line finishes, plus a step
  // whenever a function starts or gives back a value.
  const TRACER = String.raw`
import sys, io, json, builtins

_FILE = "<your code>"

class _TooManySteps(Exception):
    pass

def _short(v):
    try:
        r = repr(v)
    except Exception:
        r = "<" + type(v).__name__ + ">"
    return r if len(r) <= 120 else r[:117] + "..."

def _frames(frame):
    out = []
    f = frame
    while f is not None and f.f_code.co_filename == _FILE:
        vs = []
        for k, v in list(f.f_locals.items()):
            if k.startswith("__") or isinstance(v, type(sys)):
                continue
            if callable(v) and hasattr(v, "__code__"):
                vs.append({"name": k, "value": "function " + v.__name__ + "()", "type": "function"})
            else:
                vs.append({"name": k, "value": _short(v), "type": type(v).__name__})
        out.append({"fn": f.f_code.co_name, "vars": vs})
        f = f.f_back
    out.reverse()
    return out

def trace_code(src, max_steps):
    steps = []
    pending = {}
    errored = set()
    buf = io.StringIO()

    def snap(frame, drop_top=False):
        st = _frames(frame)
        return {"stack": st[:-1] if drop_top else st, "out": buf.getvalue()}

    def add(step):
        steps.append(step)
        if len(steps) >= max_steps:
            raise _TooManySteps()

    def finish(frame, s):
        p = pending.pop(id(frame), None)
        if p is not None:
            p["after"] = s
            add(p)

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != _FILE:
            return None
        name = frame.f_code.co_name
        if event == "call":
            if name != "<module>":
                add({"kind": "call", "line": frame.f_lineno, "fn": name,
                     "from": frame.f_back.f_lineno if frame.f_back is not None else None,
                     "after": snap(frame)})
            return tracer
        s = snap(frame)
        finish(frame, s)
        if event == "line":
            pending[id(frame)] = {"kind": "line", "line": frame.f_lineno, "fn": name}
        elif event == "exception":
            errored.add(id(frame))
        elif event == "return":
            if id(frame) in errored:
                errored.discard(id(frame))
            elif name != "<module>":
                add({"kind": "return", "line": frame.f_lineno, "fn": name,
                     "value": _short(arg), "after": snap(frame, True)})
        return tracer

    try:
        code = compile(src, _FILE, "exec")
    except SyntaxError as e:
        return json.dumps({"steps": [], "error": {"type": type(e).__name__, "message": e.msg, "line": e.lineno}, "stopped": False})

    def _no_input(*args):
        raise RuntimeError("input() can't ask you for typing here. Put the value straight into your code instead.")

    g = {"__name__": "__main__"}
    old_out, old_input = sys.stdout, builtins.input
    sys.stdout, builtins.input = buf, _no_input
    error, stopped = None, False
    sys.settrace(tracer)
    try:
        exec(code, g)
    except _TooManySteps:
        stopped = True
    except Exception as e:
        line = None
        tb = e.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == _FILE:
                line = tb.tb_lineno
            tb = tb.tb_next
        error = {"type": type(e).__name__, "message": str(e), "line": line}
    finally:
        sys.settrace(None)
        sys.stdout, builtins.input = old_out, old_input
    return json.dumps({"steps": steps, "error": error, "stopped": stopped})
`;

  const FRIENDLY = {
    SyntaxError: "Python couldn't read this line. Look for a missing bracket, colon, or quote mark.",
    IndentationError: "The spacing at the start of this line doesn't match the lines around it.",
    NameError: "Python doesn't know this name yet. Check the spelling, or set it before this line.",
    TypeError: "Two things that don't fit together were used together here, like adding a number to some text.",
    ZeroDivisionError: "This line divides by zero, which isn't possible.",
    IndexError: "This asks for a position the list doesn't have.",
    KeyError: "This asks the dictionary for a key it doesn't have.",
    AttributeError: "This value doesn't have the thing being asked for after the dot.",
    ValueError: "The value here is the right type, but not a value this step can use.",
    RecursionError: "A function kept calling itself and never stopped.",
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    examples: $("examples"), status: $("status"), editor: $("editor"), gutter: $("gutter"),
    code: $("code"), codeView: $("codeView"), run: $("run"), edit: $("edit"),
    empty: $("empty"), stepper: $("stepper"), stepCount: $("stepCount"), stepText: $("stepText"),
    stepDetails: $("stepDetails"), back: $("back"), next: $("next"), play: $("play"),
    scrub: $("scrub"), vars: $("vars"), output: $("output"),
  };

  let pyodide = null;
  let steps = [];
  let lines = [];
  let index = 0;
  let timer = null;

  // ---------- editor ----------
  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function updateGutter() {
    const n = els.code.value.split("\n").length;
    els.gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
    els.gutter.scrollTop = els.code.scrollTop;
  }

  EXAMPLES.forEach((ex, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = ex.name;
    els.examples.appendChild(opt);
  });
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = "Your own code";
  els.examples.appendChild(custom);

  const saved = load("viz-code");
  if (saved && saved.trim()) {
    els.code.value = saved;
    const match = EXAMPLES.findIndex((ex) => ex.code === saved);
    els.examples.value = match >= 0 ? String(match) : "custom";
  } else {
    els.code.value = EXAMPLES[0].code;
    els.examples.value = "0";
  }
  updateGutter();

  els.examples.addEventListener("change", () => {
    if (els.examples.value === "custom") return;
    els.code.value = EXAMPLES[Number(els.examples.value)].code;
    store("viz-code", els.code.value);
    updateGutter();
    showEditor();
  });

  els.code.addEventListener("input", () => {
    store("viz-code", els.code.value);
    els.examples.value = EXAMPLES.findIndex((ex) => ex.code === els.code.value) >= 0
      ? String(EXAMPLES.findIndex((ex) => ex.code === els.code.value)) : "custom";
    updateGutter();
  });
  els.code.addEventListener("scroll", () => { els.gutter.scrollTop = els.code.scrollTop; });
  els.code.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: t, value: v } = els.code;
      els.code.value = v.slice(0, s) + "    " + v.slice(t);
      els.code.selectionStart = els.code.selectionEnd = s + 4;
      els.code.dispatchEvent(new Event("input"));
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
  });

  // ---------- Python ----------
  (async function boot() {
    try {
      pyodide = await loadPyodide();
      pyodide.runPython(TRACER);
      els.status.textContent = "Python is ready";
      els.run.disabled = false;
    } catch (e) {
      els.status.textContent = "Python didn't load. Check your connection and refresh the page.";
    }
  })();

  function run() {
    if (!pyodide) return;
    stopPlaying();
    const src = els.code.value;
    let result;
    try {
      const fn = pyodide.globals.get("trace_code");
      result = JSON.parse(fn(src, MAX_STEPS));
      fn.destroy();
    } catch (e) {
      result = { steps: [], error: { type: "Error", message: String(e.message || e), line: null }, stopped: false };
    }
    lines = src.split("\n");
    steps = buildSteps(result);
    index = 0;
    renderCodeView();
    showStepper();
    show(0);
  }

  // ---------- steps ----------
  function indent(text) { return (text || "").match(/^\s*/)[0].length; }

  function lineText(n) { return (lines[n - 1] || "").trim(); }

  function flatVars(state) {
    const map = new Map();
    (state ? state.stack : []).forEach((frame, depth) => {
      frame.vars.forEach((v) => map.set(depth + ":" + v.name, v.value));
    });
    return map;
  }

  function buildSteps(result) {
    const raw = result.steps;
    const out = raw.map((s, i) => ({ ...s, next: raw[i + 1] }));
    const last = raw.length ? raw[raw.length - 1].after : { stack: [], out: "" };
    if (result.error) {
      out.push({ kind: "error", line: result.error.line, error: result.error, after: last });
    } else if (result.stopped) {
      out.push({ kind: "stopped", line: null, after: last });
    } else {
      out.push({ kind: "done", line: null, after: last });
    }
    return out;
  }

  function describe(step, prev, prevStep) {
    const details = [];
    const before = flatVars(prev);
    const after = flatVars(step.after);
    const depth = step.after.stack.length - 1;

    if (step.kind === "line" || step.kind === "call") {
      step.after.stack.forEach((frame, d) => {
        if (step.kind === "line" && d !== depth) return;
        frame.vars.forEach((v) => {
          const key = d + ":" + v.name;
          if (!before.has(key)) {
            if (step.kind === "call") details.push(["set", `${v.name} starts as ${v.value}`]);
            else if (v.type !== "function") details.push(["set", `${v.name} is now ${v.value}`]);
          } else if (before.get(key) !== v.value) {
            details.push(["set", `${v.name} changed from ${before.get(key)} to ${v.value}`]);
          }
        });
      });
    }

    const printed = step.after.out.slice(prev ? prev.out.length : 0);
    printed.split("\n").filter(Boolean).forEach((p) => details.push(["print", `Printed: ${p}`]));

    const t = lineText(step.line);
    let text = "";

    if (step.kind === "call") {
      const args = step.after.stack[depth].vars.map((v) => `${v.name} = ${v.value}`).join(", ");
      text = `Line ${step.from} calls ${step.fn}()${args ? ` with ${args}` : ""}. Python jumps into the function.`;
      details.length = 0;
    } else if (step.kind === "return") {
      text = `${step.fn}() is finished and gives back ${step.value}. Python goes back to where it was called from.`;
    } else if (step.kind === "done") {
      text = "Done. The program ran to the end.";
    } else if (step.kind === "stopped") {
      text = `Stopped after ${MAX_STEPS.toLocaleString()} steps. Is there a loop that never ends?`;
    } else if (step.kind === "error") {
      const where = step.line ? `on line ${step.line}` : "";
      text = `Stopped with an error ${where}. ${FRIENDLY[step.error.type] || ""}`.replace(/\s+/g, " ").trim();
      details.push(["error", `${step.error.type}: ${step.error.message}`]);
    } else {
      const resumed = prevStep && prevStep.kind === "return";
      const next = step.next && step.next.kind === "line" && step.next.fn === step.fn ? step.next : null;
      const goesIn = next && next.line > step.line && indent(lines[next.line - 1]) > indent(lines[step.line - 1]);
      const cond = t.replace(/^(if|elif|while)\s+/, "").replace(/:$/, "");
      if (/^(if|elif)\b/.test(t)) {
        text = goesIn
          ? `Line ${step.line} checks whether ${cond}. It's true, so the indented lines run.`
          : `Line ${step.line} checks whether ${cond}. It's false, so the indented lines are skipped.`;
      } else if (/^while\b/.test(t)) {
        text = goesIn
          ? `Line ${step.line} checks whether ${cond}. It's true, so the loop runs again.`
          : `Line ${step.line} checks whether ${cond}. It's false, so the loop stops.`;
      } else if (/^for\b/.test(t)) {
        text = goesIn
          ? `Line ${step.line} moves the loop on to the next item.`
          : `Line ${step.line}: there are no items left, so the loop ends.`;
      } else if (/^def\b/.test(t)) {
        const name = (t.match(/^def\s+(\w+)/) || [])[1];
        text = `Line ${step.line} sets up a function called ${name}(). Its code runs later, when something calls it.`;
        details.length = 0;
      } else if (/^return\b/.test(t)) {
        text = resumed
          ? `Back on line ${step.line}, Python uses that answer to work out the value to give back.`
          : `Line ${step.line} works out the value to give back.`;
      } else {
        text = resumed
          ? `Back on line ${step.line}, Python uses that answer to finish the line.`
          : `Line ${step.line} ran.`;
      }
    }
    return { text, details };
  }

  // ---------- rendering ----------
  function renderCodeView() {
    els.codeView.innerHTML = "";
    lines.forEach((l, i) => {
      const li = document.createElement("li");
      li.dataset.line = String(i + 1);
      const ln = document.createElement("span");
      ln.className = "ln";
      ln.textContent = String(i + 1);
      const code = document.createElement("code");
      code.textContent = l || " ";
      li.append(ln, code);
      els.codeView.appendChild(li);
    });
  }

  function renderVars(step, prev) {
    const before = flatVars(prev);
    els.vars.innerHTML = "";
    const stack = step.after.stack;
    if (!stack.length || stack.every((f) => !f.vars.length)) {
      const p = document.createElement("p");
      p.className = "viz-muted";
      p.textContent = "No variables yet.";
      els.vars.appendChild(p);
      return;
    }
    stack.forEach((frame, d) => {
      const box = document.createElement("div");
      box.className = "frame" + (d === stack.length - 1 ? " frame-current" : "");
      const h = document.createElement("p");
      h.className = "frame-name";
      h.textContent = frame.fn === "<module>" ? "Main program" : `Inside ${frame.fn}()`;
      box.appendChild(h);
      if (!frame.vars.length) {
        const p = document.createElement("p");
        p.className = "viz-muted";
        p.textContent = "Nothing set here yet.";
        box.appendChild(p);
      } else {
        const table = document.createElement("table");
        table.innerHTML = "<thead><tr><th>Name</th><th>Value</th><th>Type</th></tr></thead>";
        const body = document.createElement("tbody");
        frame.vars.forEach((v) => {
          const tr = document.createElement("tr");
          const key = d + ":" + v.name;
          if (!before.has(key) || before.get(key) !== v.value) tr.className = "changed";
          [v.name, v.value, v.type].forEach((cell, ci) => {
            const td = document.createElement("td");
            if (ci < 2) { const c = document.createElement("code"); c.textContent = cell; td.appendChild(c); }
            else td.textContent = cell;
            tr.appendChild(td);
          });
          body.appendChild(tr);
        });
        table.appendChild(body);
        box.appendChild(table);
      }
      els.vars.appendChild(box);
    });
  }

  function show(i) {
    index = Math.max(0, Math.min(steps.length - 1, i));
    const step = steps[index];
    const prev = index > 0 ? steps[index - 1].after : null;
    const { text, details } = describe(step, prev, index > 0 ? steps[index - 1] : null);

    els.stepCount.textContent = `Step ${index + 1} of ${steps.length}`;
    els.stepText.textContent = text;
    els.stepText.className = "step-text" + (step.kind === "error" ? " is-error" : "");
    els.stepDetails.innerHTML = "";
    details.forEach(([kind, d]) => {
      const li = document.createElement("li");
      li.className = "detail-" + kind;
      li.textContent = d;
      els.stepDetails.appendChild(li);
    });

    els.codeView.querySelectorAll("li").forEach((li) => li.classList.remove("current", "previous", "error-line"));
    const prevLine = index > 0 ? steps[index - 1].line : null;
    if (prevLine && prevLine !== step.line) {
      const p = els.codeView.querySelector(`li[data-line="${prevLine}"]`);
      if (p) p.classList.add("previous");
    }
    if (step.line) {
      const cur = els.codeView.querySelector(`li[data-line="${step.line}"]`);
      if (cur) {
        cur.classList.add(step.kind === "error" ? "error-line" : "current");
        cur.scrollIntoView({ block: "nearest" });
      }
    }

    renderVars(step, prev);
    els.output.textContent = step.after.out || "Nothing printed yet.";
    els.output.classList.toggle("is-empty", !step.after.out);

    els.scrub.max = String(steps.length - 1);
    els.scrub.value = String(index);
    els.back.disabled = index === 0;
    els.next.disabled = index === steps.length - 1;
    els.play.disabled = index === steps.length - 1 && !timer;
  }

  function showStepper() {
    els.editor.hidden = true;
    els.codeView.hidden = false;
    els.run.hidden = true;
    els.edit.hidden = false;
    els.empty.hidden = true;
    els.stepper.hidden = false;
  }

  function showEditor() {
    stopPlaying();
    els.editor.hidden = false;
    els.codeView.hidden = true;
    els.run.hidden = false;
    els.edit.hidden = true;
    els.empty.hidden = false;
    els.stepper.hidden = true;
  }

  function stopPlaying() {
    if (timer) clearInterval(timer);
    timer = null;
    els.play.textContent = "Play";
  }

  els.run.addEventListener("click", run);
  els.edit.addEventListener("click", () => { showEditor(); els.code.focus(); });
  els.back.addEventListener("click", () => { stopPlaying(); show(index - 1); });
  els.next.addEventListener("click", () => { stopPlaying(); show(index + 1); });
  els.scrub.addEventListener("input", () => { stopPlaying(); show(Number(els.scrub.value)); });
  els.play.addEventListener("click", () => {
    if (timer) { stopPlaying(); show(index); return; }
    if (index === steps.length - 1) show(0);
    els.play.textContent = "Pause";
    timer = setInterval(() => {
      if (index >= steps.length - 1) { stopPlaying(); show(index); return; }
      show(index + 1);
    }, 900);
  });

  document.addEventListener("keydown", (e) => {
    if (els.stepper.hidden || e.target === els.code || e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight") { e.preventDefault(); stopPlaying(); show(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); stopPlaying(); show(index - 1); }
  });
})();
