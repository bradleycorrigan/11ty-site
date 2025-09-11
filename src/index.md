---
title: Home 🏡
layout: "base.njk"
templateEngineOverride: njk,md
---

# Hi 👋
This blog is very much just a reason for me to be able to play around with eleventy (11ty) to create a static blog. I use it to post journals of travels and as a repo of knowledge. I find that writing things down helps me to synthesise knowledge, so making it public so I can find it easily myself - or even share with others - seems like a good idea. 

The light theme is based on VSCode solarized light, and the dark theme is based on fairyfloss.

There's also a link to my photography portfolio, which is a different static website - fully written by myself without any help from tools like 11ty. It's become a bit of a pain to maintain, but it's pretty and I like it.

## Blog Posts by Topic 📚

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

## All Posts 📝
{% if collections.posts and collections.posts.length > 0 %}
  {% for post in collections.posts %}
  [{{ post.data.title }}]({{ post.url}})
  {% endfor %}
{% else %}
<p>No blog posts available.</p>
{% endif %}

---

## Other stuff 🗃️
[📷 My photos](https://photos.bradleycorrigan.co.uk)

{% if collections.embeds and collections.embeds.length > 0 %}
  {% for embed in collections.embeds %}
  [{{ embed.data.title }}]({{ embed.url}})
  {% endfor %}
{% else %}
<p>No embeds available.</p>
{% endif %}
