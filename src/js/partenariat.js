// Script pour la page Partenariat
document.addEventListener('DOMContentLoaded', async function() {
    const dataLoader = new DataLoader();
    
    try {
        // Charger les données de partenariat
        const partenariatData = await dataLoader.loadPartenariat();
        
        if (partenariatData) {
            // Charger les sponsors détaillés
            loadSponsorsDetail(partenariatData.sponsors);
            
            // Charger le contenu du sponsoring
            loadSponsoringContent(partenariatData.sponsoring);
            
            // Charger le contenu des dons
            loadDonsContent(partenariatData.dons);
        } else {
            console.error('Impossible de charger les données de partenariat');
            showError('Erreur lors du chargement des données de partenariat');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur lors du chargement de la page');
    }
});

function loadSponsorsDetail(sponsors) {
    const sponsorsGrid = document.getElementById('sponsors-detail-grid');
    
    if (!sponsorsGrid) {
        console.error('Élément sponsors-detail-grid non trouvé');
        return;
    }
    
    sponsorsGrid.innerHTML = '';
    
    sponsors.forEach(sponsor => {
        const sponsorCard = document.createElement('div');
        sponsorCard.className = 'sponsor-detail-card';
        
        sponsorCard.innerHTML = `
            <div class="sponsor-header">
                <img src="${sponsor.logo}" alt="${sponsor.nom}" class="sponsor-logo">
                <div class="sponsor-info">
                    <h3>${sponsor.nom}</h3>
                    <span class="sponsor-niveau ${getSponsorLevelClass(sponsor.niveau)}">${sponsor.niveau}</span>
                </div>
            </div>
            <div class="sponsor-content">
                <p class="sponsor-description">${sponsor.description}</p>
                <div class="sponsor-details">
                    <div class="sponsor-contact">
                        ${sponsor.website ? `<p><i class="fas fa-globe"></i> <a href="${sponsor.website}" target="_blank">Site web</a></p>` : ''}
                        ${sponsor.telephone ? `<p><i class="fas fa-phone"></i> ${sponsor.telephone}</p>` : ''}
                        ${sponsor.email ? `<p><i class="fas fa-envelope"></i> <a href="mailto:${sponsor.email}">${sponsor.email}</a></p>` : ''}
                        ${sponsor.adresse ? `<p><i class="fas fa-map-marker-alt"></i> ${sponsor.adresse}</p>` : ''}
                    </div>
                    <div class="sponsor-partnership">
                        <p><i class="fas fa-handshake"></i> Partenaire depuis ${sponsor.partenariat_depuis}</p>
                    </div>
                </div>
            </div>
        `;
        
        sponsorsGrid.appendChild(sponsorCard);
    });
}

function loadSponsoringContent(sponsoring) {
    const sponsoringContent = document.getElementById('sponsoring-content');
    
    if (!sponsoringContent) {
        console.error('Élément sponsoring-content non trouvé');
        return;
    }
    
    sponsoringContent.innerHTML = `
        <div class="sponsoring-description">
            <p>${sponsoring.description}</p>
        </div>
        
        <div class="sponsoring-niveaux">
            <h3>Niveaux de partenariat</h3>
            <div class="niveaux-grid">
                ${sponsoring.niveaux.map(niveau => `
                    <div class="niveau-card ${getSponsorLevelClass(niveau.nom)}">
                        <h4>${niveau.nom}</h4>
                        <p class="niveau-montant">${niveau.montant}</p>
                        <ul class="niveau-avantages">
                            ${niveau.avantages.map(avantage => `<li>${avantage}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="sponsoring-fiscalite">
            <h3>Avantages fiscaux</h3>
            <p><i class="fas fa-calculator"></i> ${sponsoring.avantages_fiscaux}</p>
        </div>
        
        <div class="sponsoring-contact">
            <h3>Contact partenariat</h3>
            <p><i class="fas fa-user"></i> ${sponsoring.contact}</p>
        </div>
        
        <div class="sponsoring-actions">
            <a href="contact.html" class="btn btn-primary">
                <i class="fas fa-handshake"></i>
                Devenir partenaire
            </a>
        </div>
    `;
}

function loadDonsContent(dons) {
    const donsContent = document.getElementById('dons-content');
    
    if (!donsContent) {
        console.error('Élément dons-content non trouvé');
        return;
    }
    
    donsContent.innerHTML = `
        <div class="dons-description">
            <p>${dons.description}</p>
        </div>
        
        <div class="dons-utilisation">
            <h3>À quoi servent vos dons ?</h3>
            <p><i class="fas fa-info-circle"></i> ${dons.utilisation}</p>
        </div>
        
        <div class="dons-fiscalite">
            <h3>Avantages fiscaux</h3>
            <p><i class="fas fa-calculator"></i> ${dons.avantages_fiscaux}</p>
        </div>
    `;
}

function getSponsorLevelClass(niveau) {
    switch(niveau) {
        case 'Sponsor Or':
            return 'niveau-or';
        case 'Sponsor Argent':
            return 'niveau-argent';
        case 'Partenaire Bronze':
            return 'niveau-bronze';
        default:
            return 'niveau-bronze';
    }
}

function showError(message) {
    const sponsorsGrid = document.getElementById('sponsors-detail-grid');
    const sponsoringContent = document.getElementById('sponsoring-content');
    const donsContent = document.getElementById('dons-content');
    
    const errorHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    
    if (sponsorsGrid) sponsorsGrid.innerHTML = errorHTML;
    if (sponsoringContent) sponsoringContent.innerHTML = errorHTML;
    if (donsContent) donsContent.innerHTML = errorHTML;
}