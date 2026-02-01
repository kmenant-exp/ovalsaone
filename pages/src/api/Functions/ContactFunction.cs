using System.ComponentModel.DataAnnotations;
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
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
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
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Erreur de désérialisation JSON");
            return await CreateErrorResponse(req, "Format JSON invalide", HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du traitement du formulaire de contact");
            return await CreateErrorResponse(req, "Une erreur interne est survenue. Veuillez réessayer plus tard.", HttpStatusCode.InternalServerError);
        }
    }

    private static async Task<HttpResponseData> CreateErrorResponse(HttpRequestData req, string message, HttpStatusCode statusCode)
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

    private static async Task<HttpResponseData> CreateValidationErrorResponse(HttpRequestData req, string message, List<string> errors)
    {
        var response = req.CreateResponse(HttpStatusCode.BadRequest);
        response.Headers.Add("Content-Type", "application/json");
        response.Headers.Add("Access-Control-Allow-Origin", "*");

        var errorResponse = new ApiResponse<object>
        {
            Success = false,
            Message = message,
            Errors = errors
        };

        await response.WriteStringAsync(JsonSerializer.Serialize(errorResponse));
        return response;
    }
}
