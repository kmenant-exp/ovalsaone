export default function(eleventyConfig) {
    console.log("Configuring Eleventy...");
    eleventyConfig.addPassthroughCopy("./src/assets");
};