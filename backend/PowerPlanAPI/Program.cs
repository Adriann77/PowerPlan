using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

var app = builder.Build();

// Test endpoints – let's check right away that everything works
app.MapGet("/debug/users", async (AppDbContext db) =>
{
    var users = await db.Users
        .Select(u => new { u.Id, u.Username, u.CreatedAt })
        .ToListAsync();
    return Results.Ok(new { count = users.Count, users });
}).AllowAnonymous();

app.MapGet("/debug/user/{username}", async (string username, AppDbContext db) =>
{
    var user = await db.Users
        .Where(u => u.Username == username)
        .Select(u => new { u.Id, u.Username, u.CreatedAt })
        .FirstOrDefaultAsync();

    return user is not null ? Results.Ok(user) : Results.NotFound();
}).AllowAnonymous();

app.MapGet("/", () => "PowerPlan API работает!");

app.Run();