const markdownIt = require("markdown-it");
const markdownItContainer = require("markdown-it-container");


module.exports = function(eleventyConfig) {
  // Syntax highlighting
  const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
  eleventyConfig.addPlugin(syntaxHighlight);

  // Use markdown-it with the 'info' container + allow raw HTML
  const md = markdownIt({
    html: true
  }).use(markdownItContainer, 'info');
  eleventyConfig.setLibrary("md", md);

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


  return {
    dir: {
      input: "src",
      output: "docs"
    }
  };
};
