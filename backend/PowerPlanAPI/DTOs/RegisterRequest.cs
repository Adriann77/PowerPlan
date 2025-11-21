using System.ComponentModel.DataAnnotations;

namespace PowerPlanAPI.DTOs;

public record RegisterRequest(
    [Required(ErrorMessage = "Username is required")]
    [MinLength(5, ErrorMessage = "Username must be at least 5 characters")]
    string Username,
    
    [Required(ErrorMessage = "Password is required")]
    [MinLength(5, ErrorMessage = "Password must be at least 5 characters")]
    [RegularExpression(@"^(?=.*\d).+$", ErrorMessage = "Password must contain at least one number")]
    string Password
);
