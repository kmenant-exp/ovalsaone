module.exports = {
  // Contenu à analyser pour détecter les classes utilisées
  content: [
    './_site/**/*.html',
    './_site/**/*.js',
    './src/**/*.liquid',
    './src/**/*.njk',
    './src/**/*.json',
    './src/_data/**/*.json'
  ],
  
  // Fichier CSS à purger
  css: ['./_site/css-bundle.css'],
  
  // Dossier de sortie
  output: './_site',
  
  // Classes à conserver même si non détectées (générées dynamiquement)
  safelist: {
    standard: [
      // États interactifs
      'active',
      'open',
      'hidden',
      'visible',
      'show',
      'loading',
      'disabled',
      'collapsed',
      'expanded',
      
      // Classes JavaScript dynamiques
      'nav-open',
      'menu-open',
      'modal-open',
      'lightbox-open',
      'cookie-accepted',
      'cookie-banner-hidden',
      
      // Animations
      'fade-in',
      'fade-out',
      'slide-in',
      'slide-out',
      
      // Focus et accessibilité
      'focus-visible',
      'sr-only',
      
      // Scrolling
      'no-scroll',
      'scroll-locked'
    ],
    // Patterns regex pour les classes dynamiques
    deep: [
      /^lightbox/,
      /^modal/,
      /^toast/,
      /^gallery/,
      /^convocation/,
      /^event/,
      /^team-/,
      /^category-/
    ],
    // Sélecteurs avec pseudo-classes à conserver
    greedy: [
      /data-/,
      /aria-/
    ]
  },
  
  // Variables CSS à conserver
  variables: true,
  
  // Keyframes à conserver
  keyframes: true,
  
  // Font-faces à conserver
  fontFace: true,
  
  // Rejeté: afficher les statistiques
  rejected: false
};
