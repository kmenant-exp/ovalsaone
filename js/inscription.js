// JavaScript spécifique à la page inscription
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader();
    await loadInscriptionData(dataLoader);
    setupInscriptionForm();
});

async function loadInscriptionData(dataLoader) {
    try {
        const inscriptionData = await dataLoader.loadInscription();
        if (inscriptionData) {
            renderInscriptionData(inscriptionData);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données d\'inscription:', error);
    }
}

function renderInscriptionData(data) {
    // Charger les tarifs qui contiennent les catégories
    if (data.tarifs) {
        renderCategoriesFromTarifs(data.tarifs);
        renderTarifs(data.tarifs);
    }
    
    // Charger les informations d'inscription si elles existent
    if (data.inscription_info) {
        renderInscriptionInfo(data.inscription_info);
    }
}

function renderCategoriesFromTarifs(tarifs) {
    const select = document.getElementById('categorie');
    if (!select) return;

    // Garder l'option par défaut
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (defaultOption) {
        select.appendChild(defaultOption);
    }
    
    tarifs.forEach(tarif => {
        const option = document.createElement('option');
        option.value = tarif.categorie;
        option.textContent = `${tarif.categorie} (${tarif.age_min}-${tarif.age_max} ans) - ${tarif.prix}€`;
        select.appendChild(option);
    });
}

function renderTarifs(tarifs) {
    const container = document.getElementById('tarifs-container');
    if (!container) return;

    container.innerHTML = '';
    
    tarifs.forEach(tarif => {
        const tarifCard = document.createElement('div');
        tarifCard.className = 'tarif-card';
        tarifCard.innerHTML = `
            <div class="tarif-header">
                <h4 class="tarif-title">${tarif.categorie}</h4>
                <span class="tarif-prix">${tarif.prix}€</span>
                <span class="tarif-age">${tarif.age_min}-${tarif.age_max} ans</span>
            </div>
            <div class="tarif-content">
                <p class="tarif-description">${tarif.description}</p>
                ${tarif.reductions && tarif.reductions.length > 0 ? `
                <div class="tarif-reductions">
                    <h5>Réductions :</h5>
                    <ul>
                        ${tarif.reductions.map(reduction => `<li>${reduction.type} : ${reduction.montant}</li>`).join('')}
                    </ul>
                </div>` : ''}
            </div>
        `;
        container.appendChild(tarifCard);
    });
}

function renderInscriptionInfo(info) {
    const container = document.getElementById('inscription-info');
    if (!container) return;

    container.innerHTML = `
        <div class="inscription-info-content">
            <h3>Informations pratiques</h3>
            ${info.pieces_necessaires ? `
            <div class="pieces-necessaires">
                <h4>📋 Pièces nécessaires :</h4>
                <ul>
                    ${info.pieces_necessaires.map(piece => `<li>${piece}</li>`).join('')}
                </ul>
            </div>` : ''}
            ${info.dates_importantes ? `
            <div class="dates-importantes">
                <h4>📅 Dates importantes :</h4>
                <ul>
                    ${info.dates_importantes.map(date => `<li><strong>${date.evenement}</strong> : ${date.date}</li>`).join('')}
                </ul>
            </div>` : ''}
            ${info.contact ? `
            <div class="contact-inscription">
                <h4>📞 Contact :</h4>
                <p>${info.contact}</p>
            </div>` : ''}
        </div>
    `;
}

function setupInscriptionForm() {
    const form = document.getElementById('inscription-form');
    const dateNaissanceInput = document.getElementById('date-naissance');
    const categorieSelect = document.getElementById('categorie');

    if (!form) return;

    // Auto-calcul de la catégorie basée sur la date de naissance
    dateNaissanceInput?.addEventListener('change', (e) => {
        const birthDate = e.target.value;
        if (birthDate) {
            const category = RugbyClubApp.getAgeCategory(birthDate);
            categorieSelect.value = category;
        }
    });

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const statusElement = document.getElementById('form-status') || createStatusElement();
        
        // Validation du formulaire
        const validation = window.formHandler.validateForm(form);
        
        if (!validation.isValid) {
            window.formHandler.showFormStatus(
                statusElement, 
                validation.errors.join('\n'), 
                'error'
            );
            return;
        }

        // Calcul de l'âge et vérification de la catégorie
        const age = RugbyClubApp.calculateAge(validation.data.dateNaissance);
        const expectedCategory = RugbyClubApp.getAgeCategory(validation.data.dateNaissance);
        
        if (validation.data.categorie !== expectedCategory) {
            window.formHandler.showFormStatus(
                statusElement,
                `La catégorie sélectionnée ne correspond pas à l'âge (${age} ans). Catégorie recommandée: ${expectedCategory}`,
                'error'
            );
            return;
        }

        try {
            window.formHandler.setButtonLoading(submitButton, true);
            
            // Ajouter des données calculées
            const formDataWithExtras = {
                ...validation.data,
                age: age,
                dateInscription: new Date().toISOString(),
                saison: '2024-2025'
            };

            // Envoi via Azure Function
            const response = await window.formHandler.submitForm(formDataWithExtras, 'inscription');
            
            window.formHandler.showFormStatus(
                statusElement,
                'Votre inscription a été envoyée avec succès ! Nous vous contacterons bientôt.',
                'success'
            );
            
            form.reset();
            
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            window.formHandler.showFormStatus(
                statusElement,
                'Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter directement.',
                'error'
            );
        } finally {
            window.formHandler.setButtonLoading(submitButton, false);
        }
    });
}

function createStatusElement() {
    const statusElement = document.createElement('div');
    statusElement.id = 'form-status';
    statusElement.className = 'form-status hidden';
    
    const form = document.getElementById('inscription-form');
    form.parentNode.insertBefore(statusElement, form.nextSibling);
    
    return statusElement;
}
