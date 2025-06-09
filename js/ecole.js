// JavaScript spécifique à la page école
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader();
    await loadEcoleData(dataLoader);
});

async function loadEcoleData(dataLoader) {
    try {
        const ecoleData = await dataLoader.loadEcole();
        if (ecoleData) {
            renderEcoleData(ecoleData);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données de l\'école:', error);
    }
}

function renderEcoleData(data) {
    // Charger l'histoire
    if (data.histoire) {
        renderHistoire(data.histoire);
    }
    
    // Charger le bureau
    if (data.bureau) {
        renderBureau(data.bureau);
    }
    
    // Charger les entraîneurs
    if (data.entraineurs) {
        renderEntraineurs(data.entraineurs);
    }
}

function renderHistoire(histoire) {
    const container = document.getElementById('histoire-content');
    if (!container) return;

    container.innerHTML = `
        <p>${histoire.description}</p>
        <div class="histoire-stats">
            <div class="stat-item">
                <span class="stat-number">${histoire.annee_creation}</span>
                <span class="stat-label">Année de création</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${histoire.licencies}</span>
                <span class="stat-label">Licenciés</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${histoire.equipes}</span>
                <span class="stat-label">Équipes</span>
            </div>
        </div>
        ${histoire.titres && histoire.titres.length > 0 ? `
        <div class="histoire-titres">
            <h4>Nos Titres</h4>
            <ul>
                ${histoire.titres.map(titre => `<li>🏆 ${titre}</li>`).join('')}
            </ul>
        </div>` : ''}
    `;
}

function renderBureau(bureau) {
    const container = document.getElementById('bureau-grid');
    if (!container) return;

    container.innerHTML = '';
    
    bureau.forEach(membre => {
        const membreCard = document.createElement('div');
        membreCard.className = 'bureau-card';
        membreCard.innerHTML = `
            <div class="bureau-photo">
                <img src="${membre.photo}" alt="${membre.prenom} ${membre.nom}" 
                     onerror="this.src='assets/logo.svg'">
            </div>
            <div class="bureau-info">
                <h3 class="bureau-nom">${membre.prenom} ${membre.nom}</h3>
                <span class="bureau-poste">${membre.poste}</span>
                <p class="bureau-description">${membre.description}</p>
                ${membre.experience ? `<p class="bureau-experience"><strong>Expérience :</strong> ${membre.experience}</p>` : ''}
                ${membre.email ? `<a href="mailto:${membre.email}" class="bureau-email">✉️ Contact</a>` : ''}
            </div>
        `;
        container.appendChild(membreCard);
    });
}

function renderEntraineurs(entraineurs) {
    const container = document.getElementById('entraineurs-grid');
    if (!container) return;

    container.innerHTML = '';
    
    entraineurs.forEach(entraineur => {
        const entraineurCard = document.createElement('div');
        entraineurCard.className = 'entraineur-card';
        entraineurCard.innerHTML = `
            <div class="entraineur-photo">
                <img src="${entraineur.photo}" alt="${entraineur.prenom} ${entraineur.nom}"
                     onerror="this.src='assets/logo.svg'">
            </div>
            <div class="entraineur-info">
                <h3 class="entraineur-nom">${entraineur.prenom} ${entraineur.nom}</h3>
                <span class="entraineur-categories">${entraineur.categories.join(', ')}</span>
                <p class="entraineur-experience">${entraineur.experience}</p>
                ${entraineur.diplomes && entraineur.diplomes.length > 0 ? `
                <div class="entraineur-diplomes">
                    <strong>Diplômes :</strong> ${entraineur.diplomes.join(', ')}
                </div>` : ''}
                ${entraineur.specialites && entraineur.specialites.length > 0 ? `
                <div class="entraineur-specialites">
                    <strong>Spécialités :</strong> ${entraineur.specialites.join(', ')}
                </div>` : ''}
            </div>
        `;
        container.appendChild(entraineurCard);
    });
}
