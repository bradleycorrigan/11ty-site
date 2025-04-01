module.exports = function(eleventyConfig) {
    // Ensure Eleventy detects Markdown posts
    eleventyConfig.addCollection("posts", function(collectionApi) {
        return collectionApi.getFilteredByGlob("src/**/*.md");
    });

    // Pass through CSS
    eleventyConfig.addPassthroughCopy("src/style.css");

    return {
        dir: {
            input: "src",   // Source directory
            output: "docs"  // Build output directory
        }
    };
};
