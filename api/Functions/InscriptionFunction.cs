using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using RugbyClubApi.Models;
using RugbyClubApi.Services;

namespace RugbyClubApi.Functions;

public class InscriptionFunction
{
    private readonly ILogger _logger;
    private readonly IEmailService _emailService;

    public InscriptionFunction(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<InscriptionFunction>();
        _emailService = new EmailService();
    }

    [Function("Inscription")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
    {
        _logger.LogInformation("Traitement du formulaire d'inscription");

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
            var inscriptionForm = JsonSerializer.Deserialize<InscriptionFormModel>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (inscriptionForm == null)
            {
                return await CreateErrorResponse(req, "Données invalides", HttpStatusCode.BadRequest);
            }

            // Calculer l'âge
            inscriptionForm.Age = CalculateAge(inscriptionForm.DateNaissance);
            inscriptionForm.DateInscription = DateTime.Now;

            // Validation des données
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(inscriptionForm);
            
            if (!Validator.TryValidateObject(inscriptionForm, validationContext, validationResults, true))
            {
                var errors = validationResults.Select(vr => vr.ErrorMessage ?? "Erreur de validation").ToList();
                return await CreateValidationErrorResponse(req, "Données invalides", errors);
            }

            // Validation de l'âge
            if (inscriptionForm.Age < 3 || inscriptionForm.Age > 50)
            {
                return await CreateErrorResponse(req, "L'âge doit être compris entre 3 et 50 ans", HttpStatusCode.BadRequest);
            }

            // Vérifier la cohérence de la catégorie
            var categorieCalculee = GetAgeCategory(inscriptionForm.Age);
            var categorieCorrecte = inscriptionForm.Categorie.Equals(categorieCalculee, StringComparison.OrdinalIgnoreCase);

            if (!categorieCorrecte)
            {
                _logger.LogWarning($"Incohérence catégorie: choisie={inscriptionForm.Categorie}, calculée={categorieCalculee}");
            }

            // Envoyer l'email
            await _emailService.SendInscriptionEmailAsync(
                inscriptionForm.NomEnfant,
                inscriptionForm.PrenomEnfant,
                inscriptionForm.DateNaissance,
                inscriptionForm.Categorie,
                inscriptionForm.NomResponsable,
                inscriptionForm.PrenomResponsable,
                inscriptionForm.Email,
                inscriptionForm.Telephone,
                inscriptionForm.Age,
                inscriptionForm.Commentaires
            );

            _logger.LogInformation($"Inscription reçue pour {inscriptionForm.PrenomEnfant} {inscriptionForm.NomEnfant} - {inscriptionForm.Categorie}");

            // Créer la réponse de succès
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            response.Headers.Add("Access-Control-Allow-Origin", "*");

            var successResponse = new ApiResponse<object>
            {
                Success = true,
                Message = "Votre inscription a été envoyée avec succès ! Nous vous contacterons bientôt pour finaliser l'inscription.",
                Data = new
                {
                    Age = inscriptionForm.Age,
                    CategorieCalculee = categorieCalculee,
                    CategorieCorrecte = categorieCorrecte
                }
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
            _logger.LogError(ex, "Erreur lors du traitement du formulaire d'inscription");
            return await CreateErrorResponse(req, "Une erreur interne est survenue. Veuillez réessayer plus tard.", HttpStatusCode.InternalServerError);
        }
    }

    private static int CalculateAge(DateTime birthDate)
    {
        var today = DateTime.Today;
        var age = today.Year - birthDate.Year;
        
        if (birthDate.Date > today.AddYears(-age))
        {
            age--;
        }
        
        return age;
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
