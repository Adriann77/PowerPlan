using PowerPlanAPI.DTOs;
using PowerPlanAPI.Models;

namespace PowerPlanAPI.Services;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request, HttpResponse response);
    Task<UserDto> LoginAsync(LoginRequest request, HttpResponse response);
    Task LogoutAsync(HttpResponse response, string token);
}