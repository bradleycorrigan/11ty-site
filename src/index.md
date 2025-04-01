--- 
title: Hello world
layout: "base.njk"
---

Hello testing 123 456 789 10 ssss

## Blog Posts

{% if collections.posts and collections.posts.length > 0 %}
  {% for post in collections.posts %}
	[{{ post.data.title }}]({{ post.url}})
  {% endfor %}
{% else %}
  <p>No blog posts available.</p>
{% endif %}