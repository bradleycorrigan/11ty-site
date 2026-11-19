---
title: Home
layout: base.njk
hideTitle: true
templateEngineOverride: njk
---

<section class="hero">
  <h1>Things I'm working on, and things I'm into</h1>
  <p>Mostly data: SQL, Python, and analytics engineering. Also travel, music, and the odd thing I've built.</p>
</section>

<section id="writing" aria-labelledby="writing-label">
  <div class="section-head">
    <h2 class="section-label" id="writing-label">Writing</h2>
    <span>{{ collections.posts.length }} posts</span>
  </div>
  <ul class="post-list">
  {% for post in collections.posts | reverse %}
    <li>
      <a href="{{ post.url }}">
        <time datetime="{{ post.date | date('YYYY-MM-DD') }}">{{ post.date | date('short') }}</time>
        <span class="post-title">{{ post.data.title }}</span>
        {% for tag in post.data.tags %}{% if tag != "posts" %}<span class="topic">{{ tag | replace("-", " ") }}</span>{% endif %}{% endfor %}
      </a>
    </li>
  {% endfor %}
  </ul>
</section>

<section class="made" id="made" aria-labelledby="made-label">
  <h2 class="section-label" id="made-label">Other things I've made</h2>
  <div class="made-grid">
    <a href="https://photos.bradleycorrigan.co.uk"><strong>Photos</strong><span>My photography portfolio</span></a>
    <a href="/embeds/restaurants/"><strong>Restaurant list</strong><span>Places I like to eat</span></a>
    <a href="/python-visualiser/"><strong>Python visualiser</strong><span>Step through Python one line at a time</span></a>
    <a href="/embeds/meatball/"><strong>Meatball</strong><span>A cat</span></a>
  </div>
</section>
