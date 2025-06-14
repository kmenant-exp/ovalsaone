// JavaScript spécifique à la page inscription
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader();
    await loadInscriptionData(dataLoader);
    setupInscriptionForm();
});

async function loadInscriptionData(dataLoader) {
    try {
        const inscriptionData = await dataLoader.loadInscription();
        const equipesData = await dataLoader.loadEquipes();
        
        if (inscriptionData) {
            renderInscriptionData(inscriptionData, equipesData);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données d\'inscription:', error);
    }
}

function renderInscriptionData(data, equipesData) {
    // Charger les catégories depuis les équipes
    if (equipesData && equipesData.categories) {
        renderCategories(equipesData.categories, data.tarifs[0].prix);
    }
    
    // Charger les tarifs (prix unique maintenant)
    if (data.tarifs) {
        renderTarifUnique(data.tarifs[0]);
    }
    
    // Charger les documents nécessaires
    if (data.documents) {
        renderDocuments(data.documents);
    }
    
    // Charger les informations de procédure si elles existent
    if (data.procedure) {
        renderProcedureInfo(data.procedure);
    }
}

function renderCategories(categories, prixUnique) {
    const select = document.getElementById('categorie');
    if (!select) return;

    // Stocker les catégories dans une variable globale pour la fonction getAgeCategory
    window.categoriesData = categories;

    // Garder l'option par défaut
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (defaultOption) {
        select.appendChild(defaultOption);
    }
    
    categories.forEach(categorie => {
        const option = document.createElement('option');
        option.value = categorie.nom;
        option.textContent = `${categorie.nom} (${categorie.age_min}-${categorie.age_max} ans)`;
        select.appendChild(option);
    });
}

function renderTarifUnique(tarifReference) {
    const container = document.getElementById('tarifs-grid');
    if (!container) return;

    container.innerHTML = '';
    
    const tarifCard = document.createElement('div');
    tarifCard.className = 'tarif-card tarif-unique';
    tarifCard.innerHTML = `
        <div class="tarif-header">
            <h4 class="tarif-title">Tarif unique pour toutes les catégories</h4>
            <span class="tarif-prix">${tarifReference.prix}€</span>
        </div>
        <div class="tarif-content">
            <p class="tarif-description">${tarifReference.description}</p>
            ${tarifReference.reductions && tarifReference.reductions.length > 0 ? `
            <div class="tarif-reductions">
                <h5>Réductions :</h5>
                <ul>
                    ${tarifReference.reductions.map(reduction => `<li>${reduction.type} : ${reduction.montant}</li>`).join('')}
                </ul>
            </div>` : ''}
        </div>
    `;
    container.appendChild(tarifCard);
}

function renderDocuments(documents) {
    const container = document.getElementById('documents-grid');
    if (!container) return;

    container.innerHTML = '';
    
    documents.forEach(doc => {
        const documentCard = document.createElement('div');
        documentCard.className = 'document-card';
        documentCard.innerHTML = `
            <div class="document-header">
                <h4 class="document-nom">${doc.nom}</h4>
                ${doc.obligatoire ? '<span class="document-obligatoire">Obligatoire</span>' : '<span class="document-optionnel">Optionnel</span>'}
            </div>
            <div class="document-content">
                <p class="document-description">${doc.description}</p>
                ${doc.modele_telecharger ? `
                <a href="${doc.modele_telecharger}" target="_blank" class="document-download">
                    <i class="fas fa-download"></i> Télécharger le modèle
                </a>` : ''}
            </div>
        `;
        container.appendChild(documentCard);
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

function renderProcedureInfo(procedure) {
    const container = document.getElementById('procedure-info');
    if (!container) return;

    container.innerHTML = `
        <div class="procedure-content">
            <h3>Procédure d'inscription</h3>
            ${procedure.etapes ? `
            <div class="procedure-etapes">
                <h4>📋 Étapes à suivre :</h4>
                <ol>
                    ${procedure.etapes.map(etape => `<li>${etape}</li>`).join('')}
                </ol>
            </div>` : ''}
            ${procedure.dates_limites ? `
            <div class="procedure-dates">
                <h4>⏰ Dates limites :</h4>
                <ul>
                    ${Object.entries(procedure.dates_limites).map(([key, date]) => `
                        <li><strong>${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} :</strong> ${date}</li>
                    `).join('')}
                </ul>
            </div>` : ''}
            ${procedure.contact ? `
            <div class="procedure-contact">
                <h4>📞 Contact secrétariat :</h4>
                <p><strong>Email :</strong> ${procedure.contact.secretariat.email}</p>
                <p><strong>Téléphone :</strong> ${procedure.contact.secretariat.telephone}</p>
                <p><strong>Permanences :</strong> ${procedure.contact.secretariat.permanences}</p>
            </div>` : ''}
        </div>
    `;
}

function setupInscriptionForm() {
    const form = document.getElementById('inscription-form');
    const dateNaissanceInput = document.getElementById('date-naissance');
    const categorieSelect = document.getElementById('categorie');

    if (!form) return;

    // Marquer les champs comme "touchés" après interaction
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        
        // Marquer comme touché lors de la première interaction
        input.addEventListener('blur', () => {
            if (formGroup) {
                formGroup.classList.add('touched');
            }
        });
        
        // Marquer comme touché dès la première saisie
        input.addEventListener('input', () => {
            if (formGroup) {
                formGroup.classList.add('touched');
            }
        });
        
        // Pour les selects, marquer comme touché lors du changement
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', () => {
                if (formGroup) {
                    formGroup.classList.add('touched');
                }
            });
        }
    });

    // Auto-calcul de la catégorie basée sur la date de naissance
    dateNaissanceInput?.addEventListener('change', (e) => {
        const birthDate = e.target.value;
        if (birthDate) {
            const category = RugbyClubApp.getAgeCategory(birthDate);
            categorieSelect.value = category;
            // Marquer la catégorie comme touchée si elle est auto-remplie
            const categorieFormGroup = categorieSelect.closest('.form-group');
            if (categorieFormGroup) {
                categorieFormGroup.classList.add('touched');
            }
        }
    });

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Marquer tous les champs comme touchés lors de la soumission
        formInputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('touched');
            }
        });
        
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
            await window.formHandler.submitForm(formDataWithExtras, 'inscription');
            
            window.formHandler.showFormStatus(
                statusElement,
                'Votre inscription a été envoyée avec succès ! Nous vous contacterons bientôt.',
                'success'
            );
            
            form.reset();
            
            // Retirer la classe "touched" après reset
            formInputs.forEach(input => {
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('touched');
                }
            });
            
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
