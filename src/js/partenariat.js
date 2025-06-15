// JavaScript spécifique à la page partenariat
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader();
    await loadPartenariatData(dataLoader);
});

async function loadPartenariatData(dataLoader) {
    try {
        const partenariatData = await dataLoader.loadPartenariat();
        if (partenariatData) {
            renderPartenariatData(partenariatData);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données de partenariat:', error);
    }
}

function renderPartenariatData(data) {
    // Charger les sponsors actuels
    if (data.sponsors) {
        renderSponsors(data.sponsors);
    }
    
    // Charger le call-to-action partenariat
    if (data.sponsoring && data.sponsoring.call_to_action) {
        renderCallToActionPartenariat(data.sponsoring.call_to_action);
    }
    
    // Charger les avantages fiscaux
    if (data.sponsoring && data.sponsoring.avantages_fiscaux) {
        renderAvantagesFiscaux(data);
    }
}

function renderSponsors(sponsors) {
    const container = document.getElementById('sponsors-list');
    if (!container) return;

    container.innerHTML = '';
    
    sponsors.forEach(sponsor => {
        const sponsorCard = document.createElement('div');
        sponsorCard.className = 'sponsor-card';
        sponsorCard.innerHTML = `
            <div class="sponsor-logo">
                <img src="${sponsor.logo}" alt="${sponsor.nom}" onerror="this.src='assets/logo.png'">
            </div>
            <div class="sponsor-info">
                <h3 class="sponsor-name">${sponsor.nom}</h3>
                <p class="sponsor-description">${sponsor.description}</p>
                <div class="sponsor-details">
                    ${sponsor.website ? `<a href="${sponsor.website}" target="_blank" class="sponsor-link">🌐 Site web</a>` : ''}
                    ${sponsor.telephone ? `<span class="sponsor-phone">📞 ${sponsor.telephone}</span>` : ''}
                    ${sponsor.email ? `<a href="mailto:${sponsor.email}" class="sponsor-email">✉️ Email</a>` : ''}
                </div>
                <div class="sponsor-partenariat">
                    Partenaire depuis ${sponsor.partenariat_depuis}
                </div>
            </div>
        `;
        container.appendChild(sponsorCard);
    });
}

function renderCallToActionPartenariat(ctaData) {
    const container = document.getElementById('cta-partenariat');
    if (!container) return;

    container.innerHTML = `
        <div class="cta-header">
            <h4 class="cta-sous-titre">${ctaData.sous_titre}</h4>
            <p class="cta-description">${ctaData.description}</p>
        </div>
        
        <div class="avantages-grid">
            ${ctaData.avantages.map(avantage => `
                <div class="avantage-item">
                    <div class="avantage-icone">${avantage.icone}</div>
                    <div class="avantage-content">
                        <h5>${avantage.titre}</h5>
                        <p>${avantage.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAvantagesFiscaux(data) {
    const container = document.getElementById('avantages-fiscaux');
    if (!container) return;

    container.innerHTML = `
        <div class="avantages-fiscaux-content">
            <h3>Avantages Fiscaux</h3>
            <div class="avantages-grid">
                <div class="avantage-fiscal">
                    <h4>🏢 Pour les Entreprises</h4>
                    <p>${data.sponsoring.avantages_fiscaux}</p>
                </div>
                ${data.dons && data.dons.avantages_fiscaux ? `
                <div class="avantage-fiscal">
                    <h4>👤 Pour les Particuliers</h4>
                    <p>${data.dons.avantages_fiscaux}</p>
                </div>` : ''}
            </div>
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
