---
title: Home
layout: "base.njk"
templateEngineOverride: njk,md
---

## Blog Posts by Topic

{% if collections.tagList and collections.tagList.length > 0 %}
<div class="tag-columns">
  {% for tag in collections.tagList %}
    <div class="tag-column">
      <h3><a href="/tags/{{ tag | slugify }}/" class="tag-header">#{{ tag }}</a></h3>
      {% if collections.postsByTag[tag] and collections.postsByTag[tag].length > 0 %}
        <ul class="tag-posts">
          {% for post in collections.postsByTag[tag] | reverse %}
            <li><a href="{{ post.url }}">{{ post.data.title }}</a></li>
          {% endfor %}
        </ul>
      {% endif %}
    </div>
  {% endfor %}
</div>
{% else %}
<p>No tagged posts available.</p>
{% endif %}

---

## All Posts
{% if collections.posts and collections.posts.length > 0 %}
  {% for post in collections.posts %}
  [{{ post.data.title }}]({{ post.url}})
  {% endfor %}
{% else %}
<p>No blog posts available.</p>
{% endif %}

---

## Other stuff
[📷 My photos](https://photos.bradleycorrigan.co.uk)

{% if collections.embeds and collections.embeds.length > 0 %}
  {% for embed in collections.embeds %}
  [{{ embed.data.title }}]({{ embed.url}})
  {% endfor %}
{% else %}
<p>No embeds available.</p>
{% endif %}
