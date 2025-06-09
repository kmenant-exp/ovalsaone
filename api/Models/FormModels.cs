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

public class InscriptionFormModel
{
    [Required(ErrorMessage = "Le nom de l'enfant est obligatoire")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le nom doit contenir entre 2 et 50 caractères")]
    public string NomEnfant { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le prénom de l'enfant est obligatoire")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le prénom doit contenir entre 2 et 50 caractères")]
    public string PrenomEnfant { get; set; } = string.Empty;

    [Required(ErrorMessage = "La date de naissance est obligatoire")]
    public DateTime DateNaissance { get; set; }

    [Required(ErrorMessage = "La catégorie est obligatoire")]
    public string Categorie { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom du responsable est obligatoire")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le nom doit contenir entre 2 et 50 caractères")]
    public string NomResponsable { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le prénom du responsable est obligatoire")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le prénom doit contenir entre 2 et 50 caractères")]
    public string PrenomResponsable { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est obligatoire")]
    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le téléphone est obligatoire")]
    [Phone(ErrorMessage = "Le numéro de téléphone n'est pas valide")]
    public string Telephone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vous devez accepter les conditions")]
    [Range(typeof(bool), "true", "true", ErrorMessage = "Vous devez accepter les conditions d'inscription")]
    public bool AccepteConditions { get; set; }

    public string? Commentaires { get; set; }

    public int Age { get; set; }
    public DateTime DateInscription { get; set; }
    public string Saison { get; set; } = "2024-2025";
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
}
