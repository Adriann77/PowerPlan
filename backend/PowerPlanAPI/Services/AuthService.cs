using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.DTOs;
using PowerPlanAPI.Models;
using System.Security.Cryptography;

namespace PowerPlanAPI.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;

    public AuthService(AppDbContext db) => _db = db;

    public async Task<(RegisterResponse user, string token)> RegisterAsync(RegisterRequest req, HttpResponse response)
    {
        // 1. Lowercase username and check for existing
        var username = req.Username;
        var username_lower = username.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Username == username_lower))
            throw new InvalidOperationException("Username already exists");

        // 2. Hashing password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        // 3. Create User
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = username,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // 4. Session create
        var token = JwtHelper.GenerateToken(user.Id, user.Username);
        var session = new Session
        {
            Id = Guid.NewGuid().ToString(),
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        JwtHelper.SetJwtCookie(response, token);   
        return (new RegisterResponse(user.Id, user.Username), token);
    }

    public async Task<(UserDto user, string token)> LoginAsync(LoginRequest req, HttpResponse response)
    {
        var username = req.Username;
        var username_lower = req.Username.Trim().ToLowerInvariant();
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Username == username_lower);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found");
        }
        else if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        // REmove old sessions
        var oldSessions = await _db.Sessions
        .Where(s => s.UserId == user.Id && s.ExpiresAt > DateTime.UtcNow)
        .ToListAsync();

        if (oldSessions.Any())
        {
            _db.Sessions.RemoveRange(oldSessions);
        }

        // New session create 
        var token = JwtHelper.GenerateToken(user.Id, user.Username);
        var session = new Session
        {
            Id = Guid.NewGuid().ToString(),
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        JwtHelper.SetJwtCookie(response, token);
        return (new UserDto(user.Id, user.Username), token);
    }

    public async Task LogoutAsync(HttpResponse response, string token)
{
    if (!string.IsNullOrEmpty(token))
    {
        // Clearing
        var session = await _db.Sessions
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session != null)
        {
            _db.Sessions.Remove(session);
            await _db.SaveChangesAsync();
        }
    }

    // Delete cookie
    response.Cookies.Delete("jwt_token", new CookieOptions
    {
        HttpOnly = true,
        Secure = false,  // на localhost
        SameSite = SameSiteMode.Lax,
        Path = "/"
    });
}
}