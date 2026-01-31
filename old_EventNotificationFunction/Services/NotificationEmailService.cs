using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using EventNotificationFunction.Models;

namespace EventNotificationFunction.Services;

public class NotificationEmailService : INotificationEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPass;
    private readonly string _smtpFrom;
    private readonly string[] _recipients;

    public NotificationEmailService()
    {
        _smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") ?? string.Empty;
        _smtpPort = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var port) ? port : 587;
        _smtpUser = Environment.GetEnvironmentVariable("SMTP_USER") ?? string.Empty;
        _smtpPass = Environment.GetEnvironmentVariable("SMTP_PASS") ?? string.Empty;
        _smtpFrom = Environment.GetEnvironmentVariable("SMTP_FROM") ?? string.Empty;

        var recipientsString = Environment.GetEnvironmentVariable("NOTIFICATION_EMAILS") ?? string.Empty;
        _recipients = recipientsString.Split(';', StringSplitOptions.RemoveEmptyEntries)
                                      .Select(r => r.Trim())
                                      .ToArray();
    }

    public async Task SendWeeklyNotificationAsync(List<ConvocationEntity> convocations)
    {
        if (convocations == null || convocations.Count == 0)
        {
            Console.WriteLine("ℹ️  No convocations to send - skipping email");
            return;
        }

        if (_recipients.Length == 0)
        {
            Console.WriteLine("⚠️  NOTIFICATION_EMAILS not configured - no recipients");
            return;
        }

        var htmlBody = GenerateHtmlTable(convocations);
        var subject = $"Convocations de la semaine - {DateTime.Now:dd/MM/yyyy}";

        // Check if SMTP credentials are configured
        if (string.IsNullOrWhiteSpace(_smtpHost) || string.IsNullOrWhiteSpace(_smtpUser) || string.IsNullOrWhiteSpace(_smtpPass))
        {
            Console.WriteLine("⚠️  SMTP credentials not configured - logging email content instead:");
            Console.WriteLine($"From: {_smtpFrom}");
            Console.WriteLine($"To: {string.Join(", ", _recipients)}");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine($"Body:\n{htmlBody}");
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_smtpFrom));

            foreach (var recipient in _recipients)
            {
                message.To.Add(MailboxAddress.Parse(recipient));
            }

            message.Subject = subject;
            message.Body = new TextPart(TextFormat.Html)
            {
                Text = htmlBody
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUser, _smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            Console.WriteLine($"✅ Email sent successfully to {_recipients.Length} recipient(s)");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error sending email: {ex.Message}");
            throw;
        }
    }

    private string GenerateHtmlTable(List<ConvocationEntity> convocations)
    {
        // Generate event summary
        var eventSummaries = convocations
            .GroupBy(c => new { c.EventName, c.EventDate })
            .Select(g => new
            {
                g.Key.EventName,
                g.Key.EventDate,
                TotalResponses = g.Count(),
                NombrePresents = g.Count(c => c.Statut.ToLower() == "présent" || c.Statut.ToLower() == "present"),
                NombreAbsents = g.Count(c => c.Statut.ToLower() == "absent"),
                BesoinCovoiturage = g.Count(c => c.BesoinCovoiturage),
                PlacesProposees = g.Sum(c => c.PlacesProposees)
            })
            .OrderBy(s => s.EventDate)
            .ThenBy(s => s.EventName)
            .ToList();

        var html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #0066cc; margin-bottom: 10px; }
        h3 { color: #0066cc; margin-top: 30px; margin-bottom: 10px; font-size: 1.2em; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th { background-color: #0066cc; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #666; font-style: italic; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
        .badge-present { background-color: #d4edda; color: #155724; }
        .badge-absent { background-color: #f8d7da; color: #721c24; }
        .badge-maybe { background-color: #fff3cd; color: #856404; }
        .covoiturage-yes { color: #28a745; font-weight: bold; }
        .covoiturage-no { color: #999; }
    </style>
</head>
<body>
    <h2>🏉 Convocations de la semaine</h2>
    <p>Voici les convocations pour les événements des 7 prochains jours :</p>";

        // Add summary section
        html += @"
    <h3>📊 Synthèse par événement</h3>
    <table class='summary-table'>
        <thead>
            <tr>
                <th>Événement</th>
                <th>Date</th>
                <th>Total</th>
                <th>✅ Présents</th>
                <th>❌ Absents</th>
                <th>🚗 Besoin covoiturage</th>
                <th>🪑 Places proposées</th>
            </tr>
        </thead>
        <tbody>";

        foreach (var summary in eventSummaries)
        {
            var formattedDate = DateTime.TryParse(summary.EventDate, out var date) 
                ? date.ToString("dd/MM/yyyy") 
                : summary.EventDate;

            html += $@"
            <tr>
                <td><strong>{summary.EventName}</strong></td>
                <td>{formattedDate}</td>
                <td>{summary.TotalResponses}</td>
                <td>{summary.NombrePresents}</td>
                <td>{summary.NombreAbsents}</td>
                <td>{summary.BesoinCovoiturage}</td>
                <td>{summary.PlacesProposees}</td>
            </tr>";
        }

        html += @"
        </tbody>
    </table>";

        // Add detailed table
        html += @"
    <h3>📋 Détail des réponses</h3>
    <table>
        <thead>
            <tr>
                <th>Événement</th>
                <th>Date</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>Covoiturage</th>
                <th>Places</th>
            </tr>
        </thead>
        <tbody>";

        foreach (var conv in convocations)
        {
            var statutClass = conv.Statut.ToLower() switch
            {
                "présent" or "present" => "badge-present",
                "absent" => "badge-absent",
                _ => "badge-maybe"
            };

            var covoiturageClass = conv.BesoinCovoiturage ? "covoiturage-yes" : "covoiturage-no";
            var covoiturageText = conv.BesoinCovoiturage ? "Oui" : "Non";

            // Format date from yyyy-MM-dd to dd/MM/yyyy
            var formattedDate = DateTime.TryParse(conv.EventDate, out var date) 
                ? date.ToString("dd/MM/yyyy") 
                : conv.EventDate;

            html += $@"
            <tr>
                <td><strong>{conv.EventName}</strong></td>
                <td>{formattedDate}</td>
                <td>{conv.Prenom}</td>
                <td>{conv.Nom}</td>
                <td><span class='badge {statutClass}'>{conv.Statut}</span></td>
                <td class='{covoiturageClass}'>{covoiturageText}</td>
                <td>{conv.PlacesProposees}</td>
            </tr>";
        }

        html += $@"
        </tbody>
    </table>
    <p class='footer'>Email généré automatiquement le {DateTime.Now:dd/MM/yyyy à HH:mm}</p>
</body>
</html>";

        return html;
    }
}
