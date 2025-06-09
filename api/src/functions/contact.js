const { app } = require('@azure/functions');
const nodemailer = require('nodemailer');

// Configuration de l'envoi d'emails
const createTransporter = () => {
    // En production, utiliser des variables d'environnement
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

// Fonction de validation des données
const validateContactForm = (data) => {
    const errors = [];
    
    if (!data.nom || data.nom.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (!data.prenom || data.prenom.trim().length < 2) {
        errors.push('Le prénom doit contenir au moins 2 caractères');
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('L\'email n\'est pas valide');
    }
    
    if (!data.sujet || data.sujet.trim().length < 5) {
        errors.push('Le sujet doit contenir au moins 5 caractères');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Le message doit contenir au moins 10 caractères');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Fonction pour créer l'email de contact
const createContactEmail = (data) => {
    const html = `
        <h2>Nouveau message de contact - Site Rugby Club</h2>
        <h3>Informations du contact :</h3>
        <ul>
            <li><strong>Nom :</strong> ${data.nom}</li>
            <li><strong>Prénom :</strong> ${data.prenom}</li>
            <li><strong>Email :</strong> ${data.email}</li>
            <li><strong>Téléphone :</strong> ${data.telephone || 'Non renseigné'}</li>
            <li><strong>Sujet :</strong> ${data.sujet}</li>
        </ul>
        
        <h3>Message :</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1a5f1a;">
            ${data.message.replace(/\n/g, '<br>')}
        </div>
        
        <hr>
        <p><small>Message envoyé depuis le site web du Rugby Club le ${new Date().toLocaleString('fr-FR')}</small></p>
    `;
    
    return {
        from: process.env.SMTP_FROM || 'noreply@rugbyclub.fr',
        to: process.env.CONTACT_EMAIL || 'contact@rugbyclub.fr',
        replyTo: data.email,
        subject: `[Site Web] ${data.sujet}`,
        html
    };
};

// Azure Function pour le formulaire de contact
app.http('contact', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'contact',
    handler: async (request, context) => {
        context.log('Traitement du formulaire de contact');
        
        try {
            // Récupérer les données du formulaire
            const data = await request.json();
            
            // Validation des données
            const validation = validateContactForm(data);
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
            
            // Créer le transporteur email
            const transporter = createTransporter();
            
            // Préparer l'email
            const emailOptions = createContactEmail(data);
            
            // Envoyer l'email
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                await transporter.sendMail(emailOptions);
                context.log('Email de contact envoyé avec succès');
            } else {
                context.log('Configuration SMTP manquante - email simulé');
                context.log('Email qui aurait été envoyé:', emailOptions);
            }
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.'
                })
            };
            
        } catch (error) {
            context.log.error('Erreur lors du traitement du formulaire de contact:', error);
            
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
app.http('contactOptions', {
    methods: ['OPTIONS'],
    authLevel: 'anonymous',
    route: 'contact',
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
