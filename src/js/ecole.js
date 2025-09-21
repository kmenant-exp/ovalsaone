document.addEventListener('DOMContentLoaded', function() {
    const voirPlusBoutons = document.querySelectorAll('.btn-voir-plus');
    
    voirPlusBoutons.forEach(bouton => {
        bouton.addEventListener('click', function() {
            const descriptionElement = this.previousElementSibling;
            
            if (descriptionElement.classList.contains('truncated')) {
                // Afficher le texte complet
                descriptionElement.classList.remove('truncated');
                this.textContent = 'Voir moins';
            } else {
                // Tronquer le texte
                descriptionElement.classList.add('truncated');
                this.textContent = 'Voir plus';
            }
        });
    });
});