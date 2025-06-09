// JavaScript spécifique à la page équipes
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader();
    await loadEquipesData(dataLoader);
});

async function loadEquipesData(dataLoader) {
    try {
        const equipesData = await dataLoader.loadEquipes();
        if (equipesData && equipesData.categories) {
            renderEquipes(equipesData.categories);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données des équipes:', error);
    }
}

function renderEquipes(categories) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    container.innerHTML = '';
    
    categories.forEach(categorie => {
        const equipeCard = document.createElement('div');
        equipeCard.className = 'equipe-card';
        
        // Construire la tranche d'âge
        const trancheAge = `${categorie.age_min}-${categorie.age_max} ans`;
        
        // Récupérer les informations de l'entraîneur
        const entraineurInfo = categorie.entraineur ? 
            `${categorie.entraineur.nom}` : 'À définir';
        
        // Construire les horaires d'entraînement
        const horaires = categorie.planning && categorie.planning.length > 0 ?
            categorie.planning.map(p => `${p.jour} ${p.heure}`).join(', ') :
            'À définir';
        
        equipeCard.innerHTML = `
            <div class="equipe-header">
                <h3 class="equipe-title">${categorie.nom}</h3>
                <span class="equipe-age">${trancheAge}</span>
                <span class="equipe-effectif">${categorie.effectif || 0} joueurs</span>
            </div>
            <div class="equipe-content">
                <div class="equipe-info">
                    <p><strong>Entraîneur :</strong> ${entraineurInfo}</p>
                    <p><strong>Entraînements :</strong> ${horaires}</p>
                    ${categorie.entraineur && categorie.entraineur.experience ? 
                        `<p><strong>Expérience :</strong> ${categorie.entraineur.experience}</p>` : ''}
                </div>
                <div class="equipe-description">
                    <p>${categorie.description || categorie.description_activites || 'École de rugby'}</p>
                </div>
                ${categorie.planning && categorie.planning.length > 0 ? `
                <div class="equipe-planning">
                    <h4>Planning d'entraînement</h4>
                    <ul>
                        ${categorie.planning.map(seance => `
                            <li><strong>${seance.jour}</strong> : ${seance.heure} - ${seance.lieu}</li>
                        `).join('')}
                    </ul>
                </div>` : ''}
                ${categorie.resultats ? `
                <div class="equipe-resultats">
                    <h4>Derniers résultats</h4>
                    <ul>
                        ${categorie.resultats.map(resultat => `
                            <li>${resultat.adversaire} : ${resultat.score} (${resultat.date})</li>
                        `).join('')}
                    </ul>
                </div>` : ''}
            </div>
        `;
        container.appendChild(equipeCard);
    });
}
