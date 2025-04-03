module.exports = function(eleventyConfig) {
    // Ensure Eleventy detects only Markdown posts in the "src/posts" directory
    eleventyConfig.addCollection("posts", function(collectionApi) {
        return collectionApi.getFilteredByGlob("src/posts/**/*.md");  // Only include files in src/posts/
    });

    // Pass through CSS and Javascript
    eleventyConfig.addPassthroughCopy("src/style.css");
    eleventyConfig.addPassthroughCopy("src/script.js");

    return {
        dir: {
            input: "src",   // Source directory
            output: "docs"  // Build output directory
        }
    };
};
