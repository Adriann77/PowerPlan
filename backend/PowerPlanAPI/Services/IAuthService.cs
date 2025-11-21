using PowerPlanAPI.DTOs;
using PowerPlanAPI.Models;

namespace PowerPlanAPI.Services;

public interface IAuthService
{
    Task<(RegisterResponse user, string token)> RegisterAsync(RegisterRequest request, HttpResponse response);
    Task<(UserDto user, string token)> LoginAsync(LoginRequest request, HttpResponse response);
    Task LogoutAsync(HttpResponse response, string token);
}