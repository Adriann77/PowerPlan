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

// ➤ SWAGGER CONFIG
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ➤ DATABASE
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// ➤ SERVICES
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Ensure validation errors return JSON instead of HTML
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

// Add CORS
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
                "exp://127.0.0.1:8081"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});



// ➤ JWT CONFIG
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secret = builder.Configuration["Jwt:Secret"]
             ?? jwtSettings["Secret"]
             ?? throw new InvalidOperationException("JWT Secret not configured!");

var key = Encoding.UTF8.GetBytes(secret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };

        // cookie → token
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Try to get token from Authorization header first (for React Native)
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    context.Token = authHeader.Substring("Bearer ".Length).Trim();
                    return Task.CompletedTask;
                }
                
                // Fallback to cookie (for web)
                if (context.Request.Cookies.ContainsKey("jwt_token"))
                {
                    context.Token = context.Request.Cookies["jwt_token"];
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ➤ SWAGGER UI – Development only (normalne dla wszystkich projektów)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// JWT helper init
JwtHelper.Init(builder.Configuration);

app.UseCors("AllowReactNative");

// Global error handler to ensure JSON responses
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var exception = context.Features.Get<IExceptionHandlerFeature>();
        if (exception != null)
        {
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
            {
                error = exception.Error.Message
            }));
        }
    });
});

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// ➤ ENDPOINTS
app.MapGet("/", () => "PowerPlan API Works!");
app.MapControllers();

app.Run();


// ➤ JWT HELPER
public static class JwtHelper
{
    private static IConfiguration Configuration { get; set; } = null!;

    public static void Init(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public static string GenerateToken(string userId, string username)
    {
        var secret = Configuration["Jwt:Secret"]
                     ?? throw new InvalidOperationException("JWT Secret not configured!");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var jwtSettings = Configuration.GetSection("Jwt");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
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
            Secure = false,   // dla localhost ok
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            Path = "/"
        });
    }
}
