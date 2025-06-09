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
    
    // Charger les niveaux de partenariat
    if (data.partenariat && data.partenariat.niveaux) {
        renderNiveauxPartenariat(data.partenariat.niveaux);
    }
    
    // Charger les avantages fiscaux
    if (data.avantages_fiscaux_entreprises || data.avantages_fiscaux_particuliers) {
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
                <img src="${sponsor.logo}" alt="${sponsor.nom}" onerror="this.src='assets/logo.svg'">
            </div>
            <div class="sponsor-info">
                <h3 class="sponsor-name">${sponsor.nom}</h3>
                <span class="sponsor-niveau">${sponsor.niveau}</span>
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

function renderNiveauxPartenariat(niveaux) {
    const container = document.getElementById('niveaux-partenariat');
    if (!container) return;

    container.innerHTML = '';
    
    niveaux.forEach(niveau => {
        const niveauCard = document.createElement('div');
        niveauCard.className = 'niveau-card';
        niveauCard.innerHTML = `
            <div class="niveau-header">
                <h3 class="niveau-nom">${niveau.nom}</h3>
                <span class="niveau-montant">${niveau.montant}</span>
            </div>
            <div class="niveau-avantages">
                <h4>Avantages inclus :</h4>
                <ul>
                    ${niveau.avantages.map(avantage => `<li>✓ ${avantage}</li>`).join('')}
                </ul>
            </div>
        `;
        container.appendChild(niveauCard);
    });
}

function renderAvantagesFiscaux(data) {
    const container = document.getElementById('avantages-fiscaux');
    if (!container) return;

    container.innerHTML = `
        <div class="avantages-fiscaux-content">
            <h3>Avantages Fiscaux</h3>
            <div class="avantages-grid">
                ${data.avantages_fiscaux_entreprises ? `
                <div class="avantage-fiscal">
                    <h4>🏢 Pour les Entreprises</h4>
                    <p>${data.avantages_fiscaux_entreprises}</p>
                </div>` : ''}
                ${data.avantages_fiscaux_particuliers ? `
                <div class="avantage-fiscal">
                    <h4>👤 Pour les Particuliers</h4>
                    <p>${data.avantages_fiscaux_particuliers}</p>
                </div>` : ''}
            </div>
        </div>
    `;
}
