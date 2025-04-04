--- 
title: Home
layout: "base.njk"
---

## Links
[🔗 📷 My photos](https://photos.bradleycorrigan.co.uk) <br>
[🔗 🍱 My restaurant list](https://www.bradleycorrigan.co.uk/restaurants) <br>
[🔗 🐈‍⬛ Catsitting for me? Thanks, click here](https://www.bradleycorrigan.co.uk/meatball) <br>

--- 
## Blog Posts

{% if collections.posts and collections.posts.length > 0 %}
  {% for post in collections.posts %}
	[{{ post.data.title }}]({{ post.url}})
  {% endfor %}
{% else %}
  <p>No blog posts available.</p>
{% endif %}