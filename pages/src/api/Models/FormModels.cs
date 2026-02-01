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
    public List<string>? Errors { get; set; }
}
