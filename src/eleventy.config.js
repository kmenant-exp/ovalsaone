export default function(eleventyConfig) {
    console.log("Configuring Eleventy...");
    eleventyConfig.addPassthroughCopy("./assets");
};