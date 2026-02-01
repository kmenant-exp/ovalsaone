# Exemples de Code - Site Eleventy Oval Saône

Ce document fournit des exemples de code spécifiques au développement avec Eleventy et des snippets utiles pour la maintenance du site web Oval Saône.

## Sommaire
1. [Templates Eleventy](#templates-eleventy)
   - [Templates Liquid](#templates-liquid)
   - [Layouts Nunjucks](#layouts-nunjucks)
   - [Système de Bundling](#système-de-bundling)
2. [Gestion des Données](#gestion-des-données)
   - [Fichiers JSON](#fichiers-json)
   - [Front Matter](#front-matter)
3. [Frontend Complémentaire](#frontend-complémentaire)
   - [CSS](#css)
   - [JavaScript](#javascript)
4. [Backend](#backend)
   - [C# Azure Functions](#c-azure-functions)
   - [Modèles de Données](#modèles-de-données)
5. [Configurations](#configurations)
   - [Configuration Eleventy](#configuration-eleventy)
   - [Azure Static Web Apps](#azure-static-web-apps)
   - [GitHub Actions](#github-actions)

## Templates Eleventy

### Templates Liquid

#### Structure de Base d'une Page

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Titre de la Page - Oval Saône</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/cookie-banner.css">
    <link rel="stylesheet" href="css/sponsors.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
</head>
<body>
    <!-- Bandeau cookies RGPD -->
    <div id="cookie-banner" class="cookie-banner hidden">
        <div class="cookie-content">
            <p>Ce site utilise des cookies pour améliorer votre expérience.</p>
            <div class="cookie-buttons">
                <button id="accept-cookies" class="btn btn-primary">Accepter</button>
                <button id="decline-cookies" class="btn btn-secondary">Refuser</button>
            </div>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="navbar" id="navbar">
        <!-- Navigation content -->
    </nav>

    <!-- Contenu principal -->
    <main>
        <!-- Contenu spécifique à la page -->
    </main>

    <!-- Pied de page -->
    <footer>
        <!-- Footer content -->
    </footer>

    <!-- Scripts -->
    <script src="js/main.js" type="module"></script>
    <script src="js/data-loader.js" type="module"></script>
    <script src="js/page-specific.js" type="module"></script>
</body>
</html>
```

#### Exemple de Section de Contenu

```html
<section class="section-container">
    <h2 class="section-title">Titre de la Section</h2>
    <div class="section-content">
        <div class="card">
            <img src="assets/image.jpg" alt="Description" class="card-image">
            <div class="card-body">
                <h3 class="card-title">Titre de la Carte</h3>
                <p class="card-text">Description de la carte avec détails.</p>
                <a href="#" class="btn btn-primary">Bouton d'Action</a>
            </div>
        </div>
        <!-- Autres cartes ou contenu -->
    </div>
</section>
```

#### Formulaire Type

```html
<form id="contact-form" class="form">
    <div class="form-group">
        <label for="nom">Nom *</label>
        <input type="text" id="nom" name="nom" required minlength="2" maxlength="50">
        <div class="error-message" id="nom-error"></div>
    </div>
    
    <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" name="email" required>
        <div class="error-message" id="email-error"></div>
    </div>
    
    <div class="form-group">
        <label for="message">Message *</label>
        <textarea id="message" name="message" required minlength="10" maxlength="1000"></textarea>
        <div class="error-message" id="message-error"></div>
    </div>
    
    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Envoyer</button>
        <div id="form-status" class="form-status"></div>
    </div>
</form>
```

### CSS

#### Variables CSS

```css
:root {
    /* Couleurs principales */
    --primary-color: #1a73e8;
    --secondary-color: #4285f4;
    --accent-color: #fbbc04;
    --text-color: #202124;
    --light-text: #5f6368;
    --background-color: #ffffff;
    --light-background: #f8f9fa;
    
    /* Espacement */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Typographie */
    --font-family: 'Roboto', sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-xxl: 2rem;
    
    /* Bordures */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    
    /* Ombres */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    --shadow-md: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    --shadow-lg: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

#### Media Queries

```css
/* Base (mobile first) */
.container {
    padding: var(--spacing-md);
}

/* Tablettes (768px et plus) */
@media (min-width: 768px) {
    .container {
        padding: var(--spacing-lg);
    }
    
    .card-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
    }
}

/* Desktop (1024px et plus) */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-xl);
    }
    
    .card-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-lg);
    }
}

/* Grand écran (1440px et plus) */
@media (min-width: 1440px) {
    .card-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

#### Composant Card

```css
.card {
    background-color: var(--background-color);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
}

.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card-body {
    padding: var(--spacing-md);
}

.card-title {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
    color: var(--text-color);
}

.card-text {
    font-size: var(--font-size-md);
    color: var(--light-text);
    margin-bottom: var(--spacing-md);
}

.card-footer {
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--light-background);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

### JavaScript

#### Module Data Loader

```javascript
// data-loader.js
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes

class DataLoader {
    constructor() {
        this.cache = {};
    }
    
    /**
     * Charge des données depuis un fichier JSON
     * @param {string} jsonFile - Nom du fichier JSON
     * @returns {Promise<Object>} - Données JSON
     */
    async loadData(jsonFile) {
        try {
            // Vérifier le cache
            if (this.cache[jsonFile] && 
                (Date.now() - this.cache[jsonFile].timestamp) < CACHE_DURATION) {
                return this.cache[jsonFile].data;
            }
            
            // Charger depuis le serveur
            const response = await fetch(`data/${jsonFile}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Mettre en cache
            this.cache[jsonFile] = {
                data,
                timestamp: Date.now()
            };
            
            return data;
        } catch (error) {
            console.error(`Erreur de chargement ${jsonFile}:`, error);
            throw error;
        }
    }
    
    /**
     * Vide le cache pour un fichier ou tous les fichiers
     * @param {string|null} jsonFile - Nom du fichier (optionnel)
     */
    clearCache(jsonFile = null) {
        if (jsonFile) {
            delete this.cache[jsonFile];
        } else {
            this.cache = {};
        }
    }
}

// Exporter une instance unique (pattern Singleton)
export const dataLoader = new DataLoader();
```

#### Exemple d'Utilisation du Data Loader

```javascript
// page-specific.js
import { dataLoader } from './data-loader.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Afficher un indicateur de chargement
        showLoading();
        
        // Charger les données
        const data = await dataLoader.loadData('exemple.json');
        
        // Traiter les données
        renderContent(data);
        
        // Masquer l'indicateur de chargement
        hideLoading();
    } catch (error) {
        console.error('Erreur:', error);
        showError('Impossible de charger les données. Veuillez réessayer plus tard.');
    }
});

/**
 * Affiche le contenu sur la page
 * @param {Object} data - Données à afficher
 */
function renderContent(data) {
    const container = document.getElementById('content-container');
    
    if (!container) {
        console.error('Container introuvable');
        return;
    }
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer les éléments HTML
    data.items.forEach(item => {
        const element = createItemElement(item);
        container.appendChild(element);
    });
}

/**
 * Crée un élément HTML pour un item
 * @param {Object} item - Données de l'item
 * @returns {HTMLElement} - Élément HTML
 */
function createItemElement(item) {
    const element = document.createElement('div');
    element.className = 'card';
    
    element.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="card-image">
        <div class="card-body">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-text">${item.description}</p>
            <a href="${item.link}" class="btn btn-primary">Voir plus</a>
        </div>
    `;
    
    return element;
}

/**
 * Affiche un indicateur de chargement
 */
function showLoading() {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = 'Chargement en cours...';
        statusElement.className = 'status-message loading';
    }
}

/**
 * Masque l'indicateur de chargement
 */
function hideLoading() {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = '';
        statusElement.className = 'status-message';
    }
}

/**
 * Affiche un message d'erreur
 * @param {string} message - Message d'erreur
 */
function showError(message) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'status-message error';
    }
}
```

#### Gestion de Formulaire

```javascript
// form-handler.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', handleSubmit);
        
        // Ajouter la validation en temps réel
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => validateInput(input));
        });
    }
});

/**
 * Gère la soumission du formulaire
 * @param {Event} event - Événement de soumission
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formStatus = document.getElementById('form-status');
    
    // Valider tous les champs
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        formStatus.textContent = 'Veuillez corriger les erreurs dans le formulaire.';
        formStatus.className = 'form-status error';
        return;
    }
    
    // Préparer les données
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        // Afficher état en cours
        formStatus.textContent = 'Envoi en cours...';
        formStatus.className = 'form-status sending';
        
        // Envoyer à l'API
        const response = await fetch('/api/Contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Une erreur est survenue');
        }
        
        // Afficher succès
        formStatus.textContent = 'Message envoyé avec succès !';
        formStatus.className = 'form-status success';
        
        // Réinitialiser le formulaire
        form.reset();
    } catch (error) {
        console.error('Erreur:', error);
        
        // Afficher erreur
        formStatus.textContent = `Erreur: ${error.message}`;
        formStatus.className = 'form-status error';
    }
}

/**
 * Valide un champ de formulaire
 * @param {HTMLElement} input - Élément à valider
 * @returns {boolean} - true si valide, false sinon
 */
function validateInput(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    
    // Réinitialiser l'erreur
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    // Vérifier validité
    const isValid = input.checkValidity();
    
    if (!isValid && errorElement) {
        // Afficher message d'erreur approprié
        if (input.validity.valueMissing) {
            errorElement.textContent = 'Ce champ est obligatoire.';
        } else if (input.validity.typeMismatch) {
            errorElement.textContent = 'Format invalide.';
        } else if (input.validity.tooShort) {
            errorElement.textContent = `Minimum ${input.minLength} caractères.`;
        } else if (input.validity.tooLong) {
            errorElement.textContent = `Maximum ${input.maxLength} caractères.`;
        } else if (input.validity.patternMismatch) {
            errorElement.textContent = 'Format incorrect.';
        }
    }
    
    return isValid;
}
```

## Backend

### C# Azure Functions

#### Fonction de Contact

```csharp
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using RugbyClubApi.Models;
using RugbyClubApi.Services;

namespace RugbyClubApi.Functions;

public class ContactFunction
{
    private readonly ILogger _logger;
    private readonly IEmailService _emailService;

    public ContactFunction(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<ContactFunction>();
        _emailService = new EmailService();
    }

    [Function("Contact")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
    {
        _logger.LogInformation("Traitement du formulaire de contact");

        // Gestion CORS pour OPTIONS
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            var optionsResponse = req.CreateResponse(HttpStatusCode.OK);
            optionsResponse.Headers.Add("Access-Control-Allow-Origin", "*");
            optionsResponse.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
            optionsResponse.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
            return optionsResponse;
        }

        try
        {
            // Lire le contenu de la requête
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            
            if (string.IsNullOrEmpty(requestBody))
            {
                return await CreateErrorResponse(req, "Corps de la requête vide", HttpStatusCode.BadRequest);
            }

            // Désérialiser les données
            var contactForm = JsonSerializer.Deserialize<ContactFormModel>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (contactForm == null)
            {
                return await CreateErrorResponse(req, "Données invalides", HttpStatusCode.BadRequest);
            }

            // Validation des données
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(contactForm);
            
            if (!Validator.TryValidateObject(contactForm, validationContext, validationResults, true))
            {
                var errors = validationResults.Select(vr => vr.ErrorMessage ?? "Erreur de validation").ToList();
                return await CreateValidationErrorResponse(req, "Données invalides", errors);
            }

            // Envoyer l'email
            await _emailService.SendContactEmailAsync(
                contactForm.Nom, 
                contactForm.Prenom, 
                contactForm.Email, 
                contactForm.Telephone, 
                contactForm.Sujet, 
                contactForm.Message
            );

            _logger.LogInformation($"Email de contact envoyé pour {contactForm.Prenom} {contactForm.Nom}");

            // Créer la réponse de succès
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            response.Headers.Add("Access-Control-Allow-Origin", "*");

            var successResponse = new ApiResponse<object>
            {
                Success = true,
                Message = "Votre message a été envoyé avec succès. Nous vous contacterons bientôt."
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(successResponse));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du traitement du formulaire de contact");
            return await CreateErrorResponse(req, "Une erreur est survenue lors du traitement de votre demande", HttpStatusCode.InternalServerError);
        }
    }

    private async Task<HttpResponseData> CreateErrorResponse(HttpRequestData req, string message, HttpStatusCode statusCode)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");
        response.Headers.Add("Access-Control-Allow-Origin", "*");

        var errorResponse = new ApiResponse<object>
        {
            Success = false,
            Message = message
        };

        await response.WriteStringAsync(JsonSerializer.Serialize(errorResponse));
        return response;
    }

    private async Task<HttpResponseData> CreateValidationErrorResponse(HttpRequestData req, string message, List<string> errors)
    {
        var response = req.CreateResponse(HttpStatusCode.BadRequest);
        response.Headers.Add("Content-Type", "application/json");
        response.Headers.Add("Access-Control-Allow-Origin", "*");

        var errorResponse = new ApiResponse<object>
        {
            Success = false,
            Message = message,
            ValidationErrors = errors
        };

        await response.WriteStringAsync(JsonSerializer.Serialize(errorResponse));
        return response;
    }
}
```

#### Service d'Email

```csharp
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace RugbyClubApi.Services;

public interface IEmailService
{
    Task SendContactEmailAsync(string nom, string prenom, string email, string? telephone, string sujet, string message);
    Task SendInscriptionEmailAsync(/* paramètres */);
}

public class EmailService : IEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _emailFrom;
    private readonly string _emailTo;

    public EmailService()
    {
        // Récupérer les paramètres depuis les variables d'environnement
        _smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.example.com";
        _smtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        _smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? "user@example.com";
        _smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "password";
        _emailFrom = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "noreply@ovalsaone.fr";
        _emailTo = Environment.GetEnvironmentVariable("EMAIL_TO") ?? "contact@ovalsaone.fr";
    }

    public async Task SendContactEmailAsync(string nom, string prenom, string email, string? telephone, string sujet, string message)
    {
        // Créer le message
        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress("Formulaire de Contact", _emailFrom));
        emailMessage.To.Add(new MailboxAddress("Contact", _emailTo));
        emailMessage.Subject = $"Nouveau message de contact: {sujet}";

        // Corps du message
        var builder = new BodyBuilder();
        builder.HtmlBody = $@"
            <h2>Nouveau message depuis le formulaire de contact</h2>
            <p><strong>Nom:</strong> {prenom} {nom}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Téléphone:</strong> {telephone ?? "Non renseigné"}</p>
            <p><strong>Sujet:</strong> {sujet}</p>
            <p><strong>Message:</strong></p>
            <p>{message.Replace("\n", "<br>")}</p>
        ";

        emailMessage.Body = builder.ToMessageBody();

        // Envoyer l'email
        await SendEmailAsync(emailMessage);
    }

    public async Task SendInscriptionEmailAsync(/* paramètres */)
    {
        // Implémentation similaire pour les inscriptions
    }

    private async Task SendEmailAsync(MimeMessage message)
    {
        using var client = new MailKit.Net.Smtp.SmtpClient();
        
        try
        {
            await client.ConnectAsync(_smtpHost, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUsername, _smtpPassword);
            await client.SendAsync(message);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}
```

### Modèles de Données

#### Modèles de Formulaire

```csharp
using System.ComponentModel.DataAnnotations;

namespace RugbyClubApi.Models;

public class ContactFormModel
{
    [Required(ErrorMessage = "Le nom est obligatoire")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le nom doit contenir entre 2 et 50 caractères")]
    public string Nom { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le prénom est obligatoire")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le prénom doit contenir entre 2 et 50 caractères")]
    public string Prenom { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est obligatoire")]
    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Le numéro de téléphone n'est pas valide")]
    public string? Telephone { get; set; }

    [Required(ErrorMessage = "Le sujet est obligatoire")]
    [StringLength(100, MinimumLength = 5, ErrorMessage = "Le sujet doit contenir entre 5 et 100 caractères")]
    public string Sujet { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le message est obligatoire")]
    [StringLength(1000, MinimumLength = 10, ErrorMessage = "Le message doit contenir entre 10 et 1000 caractères")]
    public string Message { get; set; } = string.Empty;
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? ValidationErrors { get; set; }
}
```

## Configurations

### Azure Static Web Apps

#### staticwebapp.config.json

```json
{
  "$schema": "https://aka.ms/azure/static-web-apps/schema",
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/*.{css,scss,sass,js,ts,json,png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "mimeTypes": {
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml"
  },
  "globalHeaders": {
    "cache-control": "no-cache"
  }
}
```

### GitHub Actions

#### Workflow pour Azure Static Web Apps

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false

      - name: Setup .NET Core
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'

      - name: Build .NET Project
        run: |
          cd api
          dotnet build --configuration Release

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          app_location: "/"
          api_location: "api"
          output_location: "."
          skip_api_build: true

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

---

*Exemples de code mis à jour le 14 juin 2025*
