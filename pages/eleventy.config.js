import { basename } from 'path';

// Data files wrapped by Decap CMS as {"key": [...]} that need unwrapping
// to bare arrays for backward-compatible template access.
const UNWRAP_DATA_FILES = new Set([
    'actualites', 'bureau', 'teams', 'sponsors', 'entraineurs', 'gallery'
]);

export default function(eleventyConfig) {
    console.log("Configuring Eleventy...");

    // Custom JSON parser: auto-unwrap Decap CMS wrapped arrays
    // e.g. {"actualites": [...]} in actualites.json → returns [...] so
    // templates can keep using `{% for item in actualites %}` directly.
    eleventyConfig.addDataExtension("json", {
        parser: (contents, filePath) => {
            const data = JSON.parse(contents);
            const stem = basename(filePath, '.json');
            if (UNWRAP_DATA_FILES.has(stem)
                && data && typeof data === 'object' && !Array.isArray(data)
                && stem in data && Array.isArray(data[stem])) {
                return data[stem];
            }
            return data;
        }
    });
    
    // Copier les assets
    eleventyConfig.addPassthroughCopy("./src/assets");
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    eleventyConfig.addPassthroughCopy({ "src/site.webmanifest": "site.webmanifest" });
    eleventyConfig.addPassthroughCopy("./src/google10caf57a1b0f0906.html");
    eleventyConfig.addPassthroughCopy({ static: "/" });
    
    // Watch CSS files for changes
    eleventyConfig.addWatchTarget("./src/css/**/*.css");
    
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