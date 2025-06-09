// JavaScript spécifique à la page boutique
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader();
    await loadBoutiqueData(dataLoader);
    setupBoutiqueHandlers();
});

async function loadBoutiqueData(dataLoader) {
    try {
        const boutiqueData = await dataLoader.loadBoutique();
        if (boutiqueData && boutiqueData.produits) {
            renderBoutique(boutiqueData.produits);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données de la boutique:', error);
    }
}

function renderBoutique(produits) {
    const container = document.getElementById('boutique-container');
    if (!container) return;

    // Organiser les produits par catégories
    const produitsParCategorie = {};
    produits.forEach(produit => {
        produit.categories.forEach(categorie => {
            if (!produitsParCategorie[categorie]) {
                produitsParCategorie[categorie] = [];
            }
            produitsParCategorie[categorie].push(produit);
        });
    });

    container.innerHTML = '';
    
    Object.keys(produitsParCategorie).forEach(categorieNom => {
        const categorieSection = document.createElement('div');
        categorieSection.className = 'boutique-category';
        categorieSection.innerHTML = `
            <h3 class="category-title">${categorieNom}</h3>
            <div class="produits-grid">
                ${produitsParCategorie[categorieNom].map(produit => `
                    <div class="produit-card ${!produit.disponible ? 'produit-indisponible' : ''}">
                        <div class="produit-image">
                            <img src="${produit.image}" alt="${produit.nom}" onerror="this.src='assets/logo.svg'">
                            ${!produit.disponible ? '<div class="produit-rupture">Rupture de stock</div>' : ''}
                        </div>
                        <div class="produit-info">
                            <h4 class="produit-nom">${produit.nom}</h4>
                            <p class="produit-description">${produit.description}</p>
                            <div class="produit-details">
                                <span class="produit-prix">${produit.prix}€</span>
                                ${produit.tailles ? `<span class="produit-tailles">Tailles: ${produit.tailles.join(', ')}</span>` : ''}
                            </div>
                            <div class="produit-stock">
                                ${produit.stock ? `Stock: ${produit.stock}` : ''}
                            </div>
                            <button class="btn btn-primary produit-commander" ${!produit.disponible ? 'disabled' : ''}>
                                ${produit.disponible ? 'Commander' : 'Indisponible'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(categorieSection);
    });
}

function setupBoutiqueHandlers() {
    // Gestionnaire pour les boutons de commande
    document.addEventListener('click', (e) => {
        if (e.target.matches('.produit-card button')) {
            const produitCard = e.target.closest('.produit-card');
            const produitNom = produitCard.querySelector('.produit-nom').textContent;
            
            // Redirection vers un système de commande externe ou affichage d'un modal
            RugbyClubApp.showNotification(`Commande de "${produitNom}" en cours de développement`, 'warning');
        }
    });
}
