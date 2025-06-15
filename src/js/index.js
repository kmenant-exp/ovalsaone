// Script spécifique pour la page d'accueil

document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader();
    
    try {
        // Charger les actualités
        const actualitesData = await dataLoader.loadActualites();
        if (actualitesData && actualitesData.actualites) {
            renderActualites(actualitesData.actualites);
        }

        // Charger les sponsors
        const sponsorsData = await dataLoader.loadSponsors();
        if (sponsorsData && sponsorsData.sponsors) {
            renderSponsors(sponsorsData.sponsors);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

function renderActualites(actualites) {
    const container = document.getElementById('actualites-grid');
    if (!container) return;

    container.innerHTML = '';
    
    // Animation pour les cartes d'actualités
    const fadeInUpClass = 'fade-in-up';
    
    // Afficher les 3 dernières actualités
    const recentActualites = actualites.slice(0, 3);
    
    recentActualites.forEach((actualite, index) => {
        const article = document.createElement('article');
        article.className = `actualite-card ${fadeInUpClass}`;
        article.style.animationDelay = `${index * 0.2}s`;
        article.innerHTML = `
            <div class="actualite-image">
                <img src="${actualite.image}" alt="${actualite.titre}">
                <div class="actualite-date-badge">${formatDateShort(actualite.date)}</div>
            </div>
            <div class="actualite-content">
                <h3 class="actualite-title">${actualite.titre}</h3>
                <p class="actualite-date"><i class="far fa-calendar-alt"></i> ${formatDate(actualite.date)}</p>
                <p class="actualite-excerpt">${actualite.extrait}</p>
                <a href="#" class="btn btn-primary btn-donation">Lire la suite</a>
            </div>
        `;
        container.appendChild(article);
    });
}

// Fonction pour formater la date en format court (JJ MMM)
function formatDateShort(dateStr) {
    try {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString('fr-FR', { month: 'short' });
        return `${day} ${month}`;
    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        return dateStr;
    }
}

function renderSponsors(sponsors) {
    const container = document.getElementById('sponsors-carousel');
    if (!container) return;

    container.innerHTML = '';
    
    // Assurons-nous d'avoir suffisamment de sponsors pour remplir la bannière
    // Nous avons besoin d'au moins 10 logos pour que l'animation soit fluide
    let sponsorsToRender = [...sponsors];
    while (sponsorsToRender.length < 10) {
        sponsorsToRender = [...sponsorsToRender, ...sponsors];
    }
    
    // Créer le premier ensemble de sponsors
    sponsorsToRender.forEach(sponsor => {
        const sponsorItem = document.createElement('div');
        sponsorItem.className = 'sponsor-item';
        sponsorItem.innerHTML = `
            <div class="sponsor-logo-container">
                <img src="${sponsor.logo}" alt="${sponsor.nom}" class="sponsor-logo">
            </div>
            <h4 class="sponsor-name">${sponsor.nom}</h4>
        `;
        container.appendChild(sponsorItem);
    });
      // Dupliquer les sponsors pour un défilement infini fluide
    // Cette duplication est nécessaire pour que l'animation CSS fonctionne correctement
    sponsorsToRender.forEach(sponsor => {
        const sponsorItem = document.createElement('div');
        sponsorItem.className = 'sponsor-item';
        sponsorItem.innerHTML = `
            <div class="sponsor-logo-container">
                <img src="${sponsor.logo}" alt="${sponsor.nom}" class="sponsor-logo">
            </div>
            <h4 class="sponsor-name">${sponsor.nom}</h4>
        `;
        container.appendChild(sponsorItem);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
