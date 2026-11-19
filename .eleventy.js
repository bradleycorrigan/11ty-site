const markdownIt = require("markdown-it");
const markdownItContainer = require("markdown-it-container");

// Obsidian/GitHub-style callouts: "> [!info] text" (or a bare "[!info] text"
// paragraph) becomes the same <div class="info"> box as "::: info".
const CALLOUT_RE = /^\[!(info|note|tip|warning)\][ \t]*\n?/i;
function calloutMarkers(md) {
  md.core.ruler.after("block", "callout_markers", (state) => {
    const t = state.tokens;
    for (let i = 0; i < t.length; i++) {
      const quoted = t[i].type === "blockquote_open";
      const p = quoted ? i + 1 : i;
      if (t[p]?.type !== "paragraph_open" || t[p + 1]?.type !== "inline") continue;
      if (!quoted && t[i - 1]?.type === "blockquote_open") continue;
      const m = t[p + 1].content.match(CALLOUT_RE);
      if (!m) continue;
      const kind = m[1].toLowerCase();
      t[p + 1].content = t[p + 1].content.slice(m[0].length);
      if (quoted) {
        let depth = 0, j = i;
        for (; j < t.length; j++) {
          if (t[j].type === "blockquote_open") depth++;
          if (t[j].type === "blockquote_close" && --depth === 0) break;
        }
        t[i].tag = t[j].tag = "div";
        t[i].attrSet("class", kind);
      } else {
        const open = new state.Token("callout_open", "div", 1);
        open.attrSet("class", kind);
        open.block = true;
        const close = new state.Token("callout_close", "div", -1);
        close.block = true;
        t.splice(p + 3, 0, close);
        t.splice(p, 0, open);
        i = p + 4;
      }
    }
  });
}

module.exports = function(eleventyConfig) {
  // Syntax highlighting
  const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
  eleventyConfig.addPlugin(syntaxHighlight);

  // Use markdown-it with the 'info' container + allow raw HTML
  const md = markdownIt({ html: true })
  .use(markdownItContainer, 'info')
  .use(markdownItContainer, 'note')
  .use(markdownItContainer, 'tip')
  .use(markdownItContainer, 'warning')
  .use(calloutMarkers);

eleventyConfig.setLibrary("md", md);


  // Changes on every build so browsers fetch the new stylesheet
  eleventyConfig.addGlobalData("buildTime", () => Date.now());

  // Date filter used by tags.njk ('YYYY-MM-DD' or 'MMMM DD, YYYY')
  eleventyConfig.addFilter("date", (value, format) => {
    const d = new Date(value);
    if (format === "YYYY-MM-DD") return d.toISOString().slice(0, 10);
    if (format === "short") return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  });

  // "About 4 minutes" from a rendered post
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = String(html).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 230));
    return `about ${mins} minute${mins === 1 ? "" : "s"}`;
  });

  // Posts collection
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/**/*.md");
  });

  // Embeds collection
  eleventyConfig.addCollection("embeds", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/embeds/**/*.md");
  });

  // Create a collection of all unique tags
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set();
    collectionApi.getAll().forEach(item => {
      if (item.data.tags) {
        item.data.tags
          .filter(tag => tag !== "posts") // Filter out the "posts" tag if you use it
          .forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  });

  // Create collections for each tag
  eleventyConfig.addCollection("postsByTag", function(collectionApi) {
    const postsByTag = {};
    
    collectionApi.getFilteredByGlob("src/posts/**/*.md").forEach(post => {
      if (post.data.tags) {
        post.data.tags.forEach(tag => {
          if (tag !== "posts") { // Filter out the "posts" tag
            if (!postsByTag[tag]) {
              postsByTag[tag] = [];
            }
            postsByTag[tag].push(post);
          }
        });
      }
    });
    
    return postsByTag;
  });

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/visualiser.js");


  return {
    dir: {
      input: "src",
      output: "docs"
    }
  };
};
