const { app } = require('@azure/functions');
const nodemailer = require('nodemailer');

// Configuration de l'envoi d'emails
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Fonction de validation des données d'inscription
const validateInscriptionForm = (data) => {
    const errors = [];
    
    // Validation des données de l'enfant
    if (!data.nomEnfant || data.nomEnfant.trim().length < 2) {
        errors.push('Le nom de l\'enfant doit contenir au moins 2 caractères');
    }
    
    if (!data.prenomEnfant || data.prenomEnfant.trim().length < 2) {
        errors.push('Le prénom de l\'enfant doit contenir au moins 2 caractères');
    }
    
    if (!data.dateNaissance) {
        errors.push('La date de naissance est obligatoire');
    } else {
        const birthDate = new Date(data.dateNaissance);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 3 || age > 50) {
            errors.push('L\'âge doit être compris entre 3 et 50 ans');
        }
    }
    
    if (!data.categorie) {
        errors.push('La catégorie est obligatoire');
    }
    
    // Validation des données du responsable
    if (!data.nomResponsable || data.nomResponsable.trim().length < 2) {
        errors.push('Le nom du responsable doit contenir au moins 2 caractères');
    }
    
    if (!data.prenomResponsable || data.prenomResponsable.trim().length < 2) {
        errors.push('Le prénom du responsable doit contenir au moins 2 caractères');
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('L\'email n\'est pas valide');
    }
    
    if (!data.telephone || !/^[0-9\s\-\+\.]{10,}$/.test(data.telephone)) {
        errors.push('Le numéro de téléphone n\'est pas valide');
    }
    
    if (!data.accepteConditions) {
        errors.push('Vous devez accepter les conditions d\'inscription');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Fonction pour calculer l'âge
const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};

// Fonction pour déterminer la catégorie selon l'âge
const getAgeCategory = (birthDate) => {
    const age = calculateAge(birthDate);
    
    if (age <= 5) return 'U6';
    if (age <= 7) return 'U8';
    if (age <= 9) return 'U10';
    if (age <= 11) return 'U12';
    if (age <= 13) return 'U14';
    return 'Seniors';
};

// Fonction pour créer l'email d'inscription
const createInscriptionEmail = (data) => {
    const age = calculateAge(data.dateNaissance);
    const categorieCalculee = getAgeCategory(data.dateNaissance);
    
    const html = `
        <h2>Nouvelle inscription - Site Rugby Club</h2>
        
        <h3>Informations du licencié :</h3>
        <ul>
            <li><strong>Nom :</strong> ${data.nomEnfant}</li>
            <li><strong>Prénom :</strong> ${data.prenomEnfant}</li>
            <li><strong>Date de naissance :</strong> ${new Date(data.dateNaissance).toLocaleDateString('fr-FR')}</li>
            <li><strong>Âge :</strong> ${age} ans</li>
            <li><strong>Catégorie choisie :</strong> ${data.categorie}</li>
            <li><strong>Catégorie calculée :</strong> ${categorieCalculee}</li>
        </ul>
        
        <h3>Informations du responsable légal :</h3>
        <ul>
            <li><strong>Nom :</strong> ${data.nomResponsable}</li>
            <li><strong>Prénom :</strong> ${data.prenomResponsable}</li>
            <li><strong>Email :</strong> ${data.email}</li>
            <li><strong>Téléphone :</strong> ${data.telephone}</li>
        </ul>
        
        <h3>Informations complémentaires :</h3>
        <ul>
            <li><strong>Saison :</strong> ${data.saison}</li>
            <li><strong>Date d'inscription :</strong> ${new Date(data.dateInscription).toLocaleDateString('fr-FR')}</li>
            <li><strong>Conditions acceptées :</strong> ${data.accepteConditions ? 'Oui' : 'Non'}</li>
        </ul>
        
        ${data.commentaires ? `
        <h3>Commentaires :</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1a5f1a;">
            ${data.commentaires.replace(/\n/g, '<br>')}
        </div>
        ` : ''}
        
        <hr>
        <h3>Prochaines étapes :</h3>
        <ol>
            <li>Vérifier la cohérence de la catégorie avec l'âge</li>
            <li>Contacter la famille pour finaliser l'inscription</li>
            <li>Fournir la liste des documents nécessaires</li>
            <li>Programmer un rendez-vous pour la remise des équipements</li>
        </ol>
        
        <p><small>Inscription reçue le ${new Date().toLocaleString('fr-FR')}</small></p>
    `;
    
    return {
        from: process.env.SMTP_FROM || 'noreply@rugbyclub.fr',
        to: process.env.INSCRIPTION_EMAIL || 'secretaire@rugbyclub.fr',
        replyTo: data.email,
        subject: `[Inscription] ${data.prenomEnfant} ${data.nomEnfant} - ${data.categorie}`,
        html
    };
};

// Azure Function pour le formulaire d'inscription
app.http('inscription', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'inscription',
    handler: async (request, context) => {
        context.log('Traitement du formulaire d\'inscription');
        
        try {
            // Récupérer les données du formulaire
            const data = await request.json();
            
            // Validation des données
            const validation = validateInscriptionForm(data);
            if (!validation.isValid) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Données invalides',
                        errors: validation.errors
                    })
                };
            }
            
            // Vérifier la cohérence de la catégorie avec l'âge
            const categorieCalculee = getAgeCategory(data.dateNaissance);
            if (data.categorie !== categorieCalculee) {
                context.log(`Incohérence catégorie: choisie=${data.categorie}, calculée=${categorieCalculee}`);
            }
            
            // Créer le transporteur email
            const transporter = createTransporter();
            
            // Préparer l'email
            const emailOptions = createInscriptionEmail(data);
            
            // Envoyer l'email
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                await transporter.sendMail(emailOptions);
                context.log('Email d\'inscription envoyé avec succès');
            } else {
                context.log('Configuration SMTP manquante - email simulé');
                context.log('Email qui aurait été envoyé:', emailOptions);
            }
            
            // Log pour suivi des inscriptions
            context.log('Nouvelle inscription:', {
                nom: `${data.prenomEnfant} ${data.nomEnfant}`,
                age: calculateAge(data.dateNaissance),
                categorie: data.categorie,
                email: data.email,
                date: new Date().toISOString()
            });
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Votre inscription a été envoyée avec succès ! Nous vous contacterons bientôt pour finaliser l\'inscription.',
                    data: {
                        age: calculateAge(data.dateNaissance),
                        categorieCalculee,
                        categorieCorrecte: data.categorie === categorieCalculee
                    }
                })
            };
            
        } catch (error) {
            context.log.error('Erreur lors du traitement du formulaire d\'inscription:', error);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.'
                })
            };
        }
    }
});

// Gestion des OPTIONS pour CORS
app.http('inscriptionOptions', {
    methods: ['OPTIONS'],
    authLevel: 'anonymous',
    route: 'inscription',
    handler: async (request, context) => {
        return {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
});
