// JavaScript moderne pour la page inscription
document.addEventListener('DOMContentLoaded', async () => {
    setupModernInscriptionForm();
});

function setupModernInscriptionForm() {
    const form = document.getElementById('inscription-form');
    if (!form) return;

    // Gestion de la validation en temps réel
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Ajouter la classe touched après la première interaction
        input.addEventListener('blur', () => {
            input.closest('.form-field').classList.add('touched');
        });

        // Pour les champs date, ajouter touched dès qu'une valeur est saisie
        if (input.type === 'date') {
            input.addEventListener('change', () => {
                input.closest('.form-field').classList.add('touched');
            });
        }

        // Validation en temps réel
        input.addEventListener('input', () => {
            validateField(input);
        });
    });

    // Auto-sélection de catégorie basée sur la date de naissance
    const dateNaissance = document.getElementById('date-naissance');
    const categorieSelect = document.getElementById('categorie');
    
    if (dateNaissance && categorieSelect) {
        dateNaissance.addEventListener('change', () => {
            const age = calculateAge(new Date(dateNaissance.value));
            const categorieAuto = getCategoryFromAge(age);
            if (categorieAuto) {
                categorieSelect.value = categorieAuto;
                categorieSelect.dispatchEvent(new Event('change'));
            }
        });
    }

    // Soumission du formulaire
    form.addEventListener('submit', handleFormSubmission);
}

function validateField(field) {
    const fieldContainer = field.closest('.form-field');
    if (!fieldContainer) return;

    // Retirer les anciennes classes de validation
    fieldContainer.classList.remove('valid', 'invalid');

    // Vérifier la validité
    if (field.checkValidity() && field.value.trim() !== '') {
        fieldContainer.classList.add('valid');
    } else if (fieldContainer.classList.contains('touched') && !field.checkValidity()) {
        fieldContainer.classList.add('invalid');
    }
}

function calculateAge(birthDate) {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}

function getCategoryFromAge(age) {
    if (!window.categoriesData) return null;
    
    const category = window.categoriesData.find(cat => 
        age >= cat.age_min && age <= cat.age_max
    );
    
    return category ? category.nom : null;
}

async function handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.btn-submit');
    const statusDiv = document.getElementById('form-status') || createStatusDiv(form);
    
    // Désactiver le bouton et afficher le loading
    const originalContent = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    
    try {
        // Préparer les données
        const formData = new FormData(form);
        const inscriptionData = Object.fromEntries(formData);
        
        // Ajouter la catégorie calculée automatiquement si nécessaire
        if (inscriptionData.dateNaissance && !inscriptionData.categorie) {
            const age = calculateAge(new Date(inscriptionData.dateNaissance));
            inscriptionData.categorie = getCategoryFromAge(age) || '';
        }

        // Envoyer les données
        const response = await fetch('/api/inscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inscriptionData)
        });

        if (response.ok) {
            showStatus(statusDiv, 'success', 'Inscription envoyée avec succès ! Nous vous contacterons bientôt.');
            form.reset();
            // Retirer les classes de validation
            form.querySelectorAll('.form-field').forEach(field => {
                field.classList.remove('touched', 'valid', 'invalid');
            });
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'envoi');
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        showStatus(statusDiv, 'error', `Erreur lors de l'envoi : ${error.message}`);
    } finally {
        // Restaurer le bouton
        submitButton.disabled = false;
        submitButton.innerHTML = originalContent;
    }
}

function createStatusDiv(form) {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'form-status';
    statusDiv.className = 'form-status';
    form.appendChild(statusDiv);
    return statusDiv;
}

function showStatus(statusDiv, type, message) {
    statusDiv.className = `form-status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    // Faire défiler vers le message
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Cacher automatiquement après 5 secondes pour les succès
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}
