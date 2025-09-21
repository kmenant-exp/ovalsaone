// JavaScript pour la page d'inscription
document.addEventListener('DOMContentLoaded', () => {
    setupInscriptionPage();
});

/**
 * Configure les éléments de la page d'inscription
 * - Applique une animation au bouton d'inscription lors du survol
 */
function setupInscriptionPage() {
    // Ajout d'une petite animation sur le bouton d'inscription
    const inscriptionButton = document.querySelector('.btn-primary');
    if (inscriptionButton) {
        inscriptionButton.addEventListener('mouseover', () => {
            inscriptionButton.querySelector('i').classList.add('fa-bounce');
        });
        inscriptionButton.addEventListener('mouseout', () => {
            inscriptionButton.querySelector('i').classList.remove('fa-bounce');
        });
    }
}
