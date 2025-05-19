--- 
title: Home
layout: "base.njk"
---
## Blog Posts

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
{% if collections.posts and collections.posts.length > 0 %}
  {% for post in collections.embeds %}
	[{{ post.data.title }}]({{ post.url}})
  {% endfor %}
{% else %}
  <p>No blog posts available.</p>
{% endif %}