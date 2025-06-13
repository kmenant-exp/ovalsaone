using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace RugbyClubApi.Services;

public interface IEmailService
{
    Task SendContactEmailAsync(string nom, string prenom, string email, string? telephone, string sujet, string message);
    Task SendInscriptionEmailAsync(string nomEnfant, string prenomEnfant, DateTime dateNaissance, string categorie, 
        string nomResponsable, string prenomResponsable, string email, string telephone, int age, string? commentaires);
}

public class EmailService : IEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPass;
    private readonly string _fromEmail;
    private readonly string _contactEmail;
    private readonly string _inscriptionEmail;

    public EmailService()
    {
        _smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
        _smtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        _smtpUser = Environment.GetEnvironmentVariable("SMTP_USER") ?? "";
        _smtpPass = Environment.GetEnvironmentVariable("SMTP_PASS") ?? "";
        _fromEmail = Environment.GetEnvironmentVariable("SMTP_FROM") ?? "noreply@rugbyclub.fr";
        _contactEmail = Environment.GetEnvironmentVariable("CONTACT_EMAIL") ?? "contact@rugbyclub.fr";
        _inscriptionEmail = Environment.GetEnvironmentVariable("INSCRIPTION_EMAIL") ?? "secretaire@rugbyclub.fr";
    }

    public async Task SendContactEmailAsync(string nom, string prenom, string email, string? telephone, string sujet, string message)
    {        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress("Oval Saône Website", _fromEmail));
        emailMessage.To.Add(new MailboxAddress("", _contactEmail));
        emailMessage.ReplyTo.Add(new MailboxAddress($"{prenom} {nom}", email));
        emailMessage.Subject = $"[Site Web] {sujet}";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = CreateContactEmailHtml(nom, prenom, email, telephone, sujet, message)
        };

        emailMessage.Body = bodyBuilder.ToMessageBody();

        await SendEmailAsync(emailMessage);
    }

    public async Task SendInscriptionEmailAsync(string nomEnfant, string prenomEnfant, DateTime dateNaissance, string categorie, 
        string nomResponsable, string prenomResponsable, string email, string telephone, int age, string? commentaires)
    {
        var emailMessage = new MimeMessage();        emailMessage.From.Add(new MailboxAddress("Oval Saône Website", _fromEmail));
        emailMessage.To.Add(new MailboxAddress("", _inscriptionEmail));
        emailMessage.ReplyTo.Add(new MailboxAddress($"{prenomResponsable} {nomResponsable}", email));
        emailMessage.Subject = $"[Inscription] {prenomEnfant} {nomEnfant} - {categorie}";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = CreateInscriptionEmailHtml(nomEnfant, prenomEnfant, dateNaissance, categorie, 
                nomResponsable, prenomResponsable, email, telephone, age, commentaires)
        };

        emailMessage.Body = bodyBuilder.ToMessageBody();

        await SendEmailAsync(emailMessage);
    }

    private async Task SendEmailAsync(MimeMessage message)
    {
        if (string.IsNullOrEmpty(_smtpUser) || string.IsNullOrEmpty(_smtpPass))
        {
            // En mode développement, logger au lieu d'envoyer
            Console.WriteLine("=== EMAIL SIMULATION ===");
            Console.WriteLine($"From: {message.From}");
            Console.WriteLine($"To: {message.To}");
            Console.WriteLine($"Subject: {message.Subject}");
            Console.WriteLine($"Body: {message.HtmlBody}");
            Console.WriteLine("========================");
            return;
        }

        using var client = new SmtpClient();
        await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_smtpUser, _smtpPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private string CreateContactEmailHtml(string nom, string prenom, string email, string? telephone, string sujet, string message)
    {
        return $@"
            <h2>Nouveau message de contact - Site Oval Saône</h2>
            <h3>Informations du contact :</h3>
            <ul>
                <li><strong>Nom :</strong> {nom}</li>
                <li><strong>Prénom :</strong> {prenom}</li>
                <li><strong>Email :</strong> {email}</li>
                <li><strong>Téléphone :</strong> {telephone ?? "Non renseigné"}</li>
                <li><strong>Sujet :</strong> {sujet}</li>
            </ul>
            
            <h3>Message :</h3>
            <div style=""background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1a5f1a;"">
                {message.Replace("\n", "<br>")}
            </div>
            
            <hr>
            <p><small>Message envoyé depuis le site web de l'Oval Saône le {DateTime.Now:dd/MM/yyyy HH:mm}</small></p>
        ";
    }

    private string CreateInscriptionEmailHtml(string nomEnfant, string prenomEnfant, DateTime dateNaissance, string categorie, 
        string nomResponsable, string prenomResponsable, string email, string telephone, int age, string? commentaires)
    {
        var categorieCalculee = GetAgeCategory(age);
        
        return $@"
            <h2>Nouvelle inscription - Site Oval Saône</h2>
            
            <h3>Informations du licencié :</h3>
            <ul>
                <li><strong>Nom :</strong> {nomEnfant}</li>
                <li><strong>Prénom :</strong> {prenomEnfant}</li>
                <li><strong>Date de naissance :</strong> {dateNaissance:dd/MM/yyyy}</li>
                <li><strong>Âge :</strong> {age} ans</li>
                <li><strong>Catégorie choisie :</strong> {categorie}</li>
                <li><strong>Catégorie calculée :</strong> {categorieCalculee}</li>
            </ul>
            
            <h3>Informations du responsable légal :</h3>
            <ul>
                <li><strong>Nom :</strong> {nomResponsable}</li>
                <li><strong>Prénom :</strong> {prenomResponsable}</li>
                <li><strong>Email :</strong> {email}</li>
                <li><strong>Téléphone :</strong> {telephone}</li>
            </ul>
            
            <h3>Informations complémentaires :</h3>
            <ul>
                <li><strong>Saison :</strong> 2024-2025</li>
                <li><strong>Date d'inscription :</strong> {DateTime.Now:dd/MM/yyyy}</li>
            </ul>
            
            {(string.IsNullOrEmpty(commentaires) ? "" : $@"
            <h3>Commentaires :</h3>
            <div style=""background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1a5f1a;"">
                {commentaires.Replace("\n", "<br>")}
            </div>
            ")}
            
            <hr>
            <h3>Prochaines étapes :</h3>
            <ol>
                <li>Vérifier la cohérence de la catégorie avec l'âge</li>
                <li>Contacter la famille pour finaliser l'inscription</li>
                <li>Fournir la liste des documents nécessaires</li>
                <li>Programmer un rendez-vous pour la remise des équipements</li>
            </ol>
            
            <p><small>Inscription reçue le {DateTime.Now:dd/MM/yyyy HH:mm}</small></p>
        ";
    }

    private static string GetAgeCategory(int age)
    {
        return age switch
        {
            <= 5 => "U6",
            <= 7 => "U8",
            <= 9 => "U10",
            <= 11 => "U12",
            <= 13 => "U14",
            _ => "Seniors"
        };
    }
}
