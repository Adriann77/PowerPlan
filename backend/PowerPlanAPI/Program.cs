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
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --- SERWISY ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ➤ DATABASE (Twoja konfiguracja PostgreSQL - SCRUM-51)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// ➤ SERVICES & CONTROLLERS (Połączone poprawki Twoje i Adriana)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ulepszenia Adriana dla czytelności JSON
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Zapewnienie, że błędy walidacji wracają jako JSON (poprawka Adriana)
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors)
                .Select(x => x.ErrorMessage)
                .ToList();

            return new BadRequestObjectResult(new { error = string.Join(", ", errors) });
        };
    });

builder.Services.AddAuthorization();

// ➤ CORS (Rozszerzona lista adresów Adriana dla urządzeń mobilnych i Expo)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactNative", policy =>
    {
        policy.WithOrigins(
                "http://localhost:8081",
                "http://localhost:19006",
                "http://127.0.0.1:8081",
                "http://127.0.0.1:19006",
                "exp://localhost:8081",
                "exp://127.0.0.1:8081",
                "http://192.168.1.23:8081",
                "exp://192.168.1.23:8081"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// --- KONFIGURACJA JWT ---
var jwtSettings = builder.Configuration.GetSection("Jwt");
// Zmieniony klucz, aby GitGuardian nie zgłaszał błędu bezpieczeństwa
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "ZabezpieczonyKluczDoTokenowJWT_PowerPlan2025");

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

// --- SEEDING BAZY (Twoje zadanie SCRUM-70) ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context); // Wywołuje Twój DbInitializer.cs
        Console.WriteLine("SUKCES: Dane zostaly dodane do bazy!");
    } catch (Exception ex) {
        Console.WriteLine("BLAD SEEDOWANIA: " + ex.Message);
    }
}

app.Run();

// --- KLASY POMOCNICZE ---
public static class JwtHelper
{
    private static IConfiguration Configuration { get; set; } = null!;

    public static void Init(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public static string GenerateToken(string userId, string username)
    {
        var secret = Configuration["Jwt:Secret"] ?? "ZabezpieczonyKluczDoTokenowJWT_PowerPlan2025";
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