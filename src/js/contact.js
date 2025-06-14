// JavaScript spécifique à la page contact
document.addEventListener('DOMContentLoaded', () => {
    setupContactForm();
});

function setupContactForm() {
    const form = document.getElementById('contact-form');
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const statusElement = document.getElementById('form-status');
        
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

        try {
            window.formHandler.setButtonLoading(submitButton, true);
            
            // Ajouter des métadonnées
            const formDataWithExtras = {
                ...validation.data,
                dateEnvoi: new Date().toISOString(),
                source: 'site-web'
            };

            // Envoi via Azure Function
            const response = await window.formHandler.submitForm(formDataWithExtras, 'contact');
            
            window.formHandler.showFormStatus(
                statusElement,
                'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
                'success'
            );
            
            form.reset();
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            window.formHandler.showFormStatus(
                statusElement,
                'Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter directement par téléphone.',
                'error'
            );
        } finally {
            window.formHandler.setButtonLoading(submitButton, false);
        }
    });
}
