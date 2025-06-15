export default function(eleventyConfig) {
    console.log("Configuring Eleventy...");
    
    // Copier les assets
    eleventyConfig.addPassthroughCopy("./src/assets");
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    
    // Configuration globale du site pour le SEO
    eleventyConfig.addGlobalData("site", {
        url: "https://ovalsaone.fr", // Remplacer par votre vraie URL
        name: "École de Rugby Oval Saône",
        description: "École de rugby pour enfants de 4 à 14 ans à Trévoux/Sainte-Euphémie",
        author: "École de Rugby Oval Saône"
    });
    
    // Ajouter des filtres pour les URLs absolues
    eleventyConfig.addFilter("absoluteUrl", function(url) {
        return `https://ovalsaone.fr${url}`; // Remplacer par votre vraie URL
    });
    
    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
};