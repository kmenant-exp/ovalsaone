// Data loader pour charger les données JSON de façon dynamique

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.baseUrl = '/data';
    }

    async loadData(filename) {
        // Vérifier le cache
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }

        try {
            const response = await fetch(`${this.baseUrl}/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.cache.set(filename, data);
            return data;
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }

    // Méthodes pour charger les données spécifiques    
    async loadActualites() {
        return await this.loadData('actualites.json');
    }

    async loadSponsors() {
        return await this.loadData('partenariat.json').then(data => {
            if (data && data.sponsors) {
                return { sponsors: data.sponsors };
            } else {
                console.warn('No sponsors found in the data');
                return { sponsors: [] };
            }
        });
    }

    async loadEquipes() {
        return await this.loadData('equipes.json');
    }

    async loadEcole() {
        return await this.loadData('ecole.json');
    }

    async loadPartenariat() {
        return await this.loadData('partenariat.json');
    }

    async loadBoutique() {
        return await this.loadData('boutique.json');
    }

    async loadInscription() {
        return await this.loadData('inscription.json');
    }

    // Alias pour compatibilité avec l'ancien code
    async loadCategories() {
        return await this.loadEquipes();
    }

    async loadEcoleData() {
        return await this.loadEcole();
    }

    async loadPartenariatData() {
        return await this.loadPartenariat();
    }

    async loadBoutiqueData() {
        return await this.loadBoutique();
    }

    async loadInscriptionData() {
        return await this.loadInscription();
    }

    // Méthodes utilitaires
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
        });
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }
}
