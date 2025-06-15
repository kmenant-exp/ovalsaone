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
            renderProduitsFeatured(boutiqueData.produits);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données de la boutique:', error);
    }
}

function renderProduitsFeatured(produits) {
    const container = document.getElementById('produits-featured');
    if (!container) return;

    container.innerHTML = produits.map(produit => `
        <div class="produit-featured-card">
            <div class="produit-image">
                <img src="${produit.image}" alt="${produit.nom}" onerror="this.src='assets/logo.png'">
                <div class="produit-badge">Produit phare</div>
            </div>
            <div class="produit-info">
                <h3 class="produit-nom">${produit.nom}</h3>
                <p class="produit-description">${produit.description}</p>
                <div class="produit-details">
                    <span class="produit-prix">${produit.prix}€</span>
                    ${produit.tailles ? `<span class="produit-tailles">Tailles: ${produit.tailles.join(', ')}</span>` : ''}
                </div>
                <div class="produit-stock">Stock: ${produit.stock}</div>
                <a href="${produit.url}" class="btn btn-primary btn-donation" data-produit="${produit.nom}">
                    <i class="fas fa-eye"></i>
                    Voir sur HelloAsso
                </a>
            </div>
        </div>
    `).join('');
}

function setupBoutiqueHandlers() {
    // Gestionnaire pour les boutons "Voir sur HelloAsso"
    document.addEventListener('click', (e) => {
        if (e.target.matches('.produit-voir-plus') || e.target.closest('.produit-voir-plus')) {
            // Redirection vers HelloAsso
            window.open('https://helloasso.com/associations/rugby-club', '_blank');
        }
        
        // Gestionnaire pour le bouton principal CTA
        if (e.target.matches('.boutique-cta-btn') || e.target.closest('.boutique-cta-btn')) {
            // Analytics ou tracking si nécessaire
            console.log('Redirection vers boutique HelloAsso');
        }
    });
}
