using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PowerPlanAPI.Data;
using PowerPlanAPI.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- SERWISY ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddControllers();
builder.Services.AddAuthorization();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactNative", policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// --- KONFIGURACJA JWT ---
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "DefaultSecretKey1234567890123456");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

var app = builder.Build();

// --- MIDDLEWARE ---
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

JwtHelper.Init(builder.Configuration);
app.UseCors("AllowReactNative");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// --- SEEDING BAZY (To Twoje zadanie SCRUM-70) ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context); // To wywołuje Twój plik DbInitializer.cs
        Console.WriteLine("SUKCES: Dane zostaly dodane do bazy!");
    } catch (Exception ex) {
        Console.WriteLine("BLAD SEEDOWANIA: " + ex.Message);
    }
}

app.Run();

// --- KLASY POMOCNICZE (MUSZĄ BYĆ NA SAMYM DOLE) ---
public static class JwtHelper
{
    private static IConfiguration Configuration { get; set; } = null!;

    public static void Init(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public static string GenerateToken(string userId, string username)
    {
        var secret = Configuration["Jwt:Secret"] ?? "DefaultSecretKey1234567890123456";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username)
        };

        var token = new JwtSecurityToken(
            issuer: Configuration["Jwt:Issuer"],
            audience: Configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static void SetJwtCookie(HttpResponse response, string token)
    {
        response.Cookies.Append("jwt_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            Path = "/"
        });
    }
}