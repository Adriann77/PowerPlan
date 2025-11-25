using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.Models;
using System.Security.Claims;

namespace PowerPlanAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // wymagamy zalogowanego użytkownika
public class WorkoutPlansController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkoutPlansController(AppDbContext db)
    {
        _db = db;
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User id not found in token.");
        }
        return userId;
    }

    // SCRUM-53: Implement `GET /api/workoutplans` (list user's workout plans)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkoutPlan>>> GetUserWorkoutPlans()
    {
        var userId = GetCurrentUserId();

        var plans = await _db.WorkoutPlans
            .Where(p => p.UserId == userId)
            .ToListAsync();

        return Ok(plans);
    }

    // SCRUM-54: Implement GET /api/workoutplans/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkoutPlan>> GetWorkoutPlanById(string id)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan == null)
        {
            return NotFound();
        }

        return Ok(plan);
    }

    // SCRUM-55: Implement POST /api/workoutplans
    [HttpPost]
    public async Task<ActionResult<WorkoutPlan>> CreateWorkoutPlan([FromBody] WorkoutPlan request)
    {
        var userId = GetCurrentUserId();

        var plan = new WorkoutPlan
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            WeekDuration = request.WeekDuration,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.WorkoutPlans.Add(plan);
        await _db.SaveChangesAsync();

        // Zwracamy 201 + Location header
        return CreatedAtAction(nameof(GetWorkoutPlanById), new { id = plan.Id }, plan);
    }

    // SCRUM-56: PUT /api/workoutplans/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkoutPlan(string id, [FromBody] WorkoutPlan request)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan == null)
        {
            return NotFound();
        }

        plan.Name = request.Name;
        plan.Description = request.Description;
        plan.WeekDuration = request.WeekDuration;
        plan.IsActive = request.IsActive;
        plan.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // SCRUM-57: DELETE /api/workoutplans/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkoutPlan(string id)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan == null)
        {
            return NotFound();
        }

        _db.WorkoutPlans.Remove(plan);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
