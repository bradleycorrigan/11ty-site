const markdownIt = require("markdown-it");
const markdownItContainer = require("markdown-it-container");

module.exports = function(eleventyConfig) {
  // Syntax highlighting - ADD THIS FIRST!
  const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
  eleventyConfig.addPlugin(syntaxHighlight);

  // Use markdown-it with the 'info' container
  const md = markdownIt().use(markdownItContainer, 'info');
  eleventyConfig.setLibrary("md", md);

  // Posts collection
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/**/*.md");
  });

  // Embeds collection
  eleventyConfig.addCollection("embeds", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/embeds/**/*.md");
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