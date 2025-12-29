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
    public async Task<ActionResult<IEnumerable<WorkoutPlanDTO>>> GetUserWorkoutPlans()
    {
        var userId = GetCurrentUserId();

        var plans = await _db.WorkoutPlans
            .Include(p => p.TrainingDays)
            .Include(p => p.WorkoutSessions)
            .Where(p => p.UserId == userId)
            .Select(p => new WorkoutPlanDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                WeekDuration = p.WeekDuration,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                TrainingDaysCount = p.TrainingDays.Count,
                WorkoutSessionsCount = p.WorkoutSessions.Count
            })
            .ToListAsync();

        return Ok(plans);
    }

    // SCRUM-54: Implement GET /api/workoutplans/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkoutPlanDTO>> GetWorkoutPlanById(string id)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .Include(p => p.TrainingDays)
            .Include(p => p.WorkoutSessions)
            .Where(p => p.Id == id && p.UserId == userId)
            .Select(p => new WorkoutPlanDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                WeekDuration = p.WeekDuration,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                TrainingDaysCount = p.TrainingDays.Count,
                WorkoutSessionsCount = p.WorkoutSessions.Count
            })
            .FirstOrDefaultAsync();

        if (plan == null)
        {
            return NotFound();
        }
        return Ok(plan);
    }

    // SCRUM-55: Implement POST /api/workoutplans
    [HttpPost]
    public async Task<ActionResult<WorkoutPlanDTO>> CreateWorkoutPlan([FromBody] CreateWorkoutPlanDTO request)
    {
        var userId = GetCurrentUserId();

        var user = await _db.Users.FirstOrDefaultAsync(p => p.Id == userId);

        if (user == null)
            return BadRequest(new { error = "User not found" });

        var existed = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Name == request.Name && p.UserId == userId);

        if (existed != null)
            return Conflict(new { error = "Workout plan with this name already exists." });

        var plan = new WorkoutPlan
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            WeekDuration = request.WeekDuration,
            IsActive = request.IsActive,
            User = user,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            _db.WorkoutPlans.Add(plan);
            await _db.SaveChangesAsync();
        }
        catch (Exception err)
        {
            return StatusCode(500, new { error = "An unexpected error occurred.", details = err.Message });
        }

        var planDto = new WorkoutPlanDTO
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            WeekDuration = plan.WeekDuration,
            IsActive = plan.IsActive,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            TrainingDaysCount = plan.TrainingDays.Count,
            WorkoutSessionsCount = plan.WorkoutSessions.Count
        };

        return CreatedAtAction(nameof(GetWorkoutPlanById), new { id = plan.Id }, planDto);
    }

    // SCRUM-56: PUT /api/workoutplans/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkoutPlan(string id, [FromBody] UpdateWorkoutPlanDTO request)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan == null)
        {
            return NotFound(new { error = "Workout plan not found." });
        }

        var duplicate = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Name == request.Name && p.Id != id);

        if (duplicate != null)
            return Conflict(new { error = "Workout plan with this name already exists." });

        plan.Name = request.Name;
        plan.Description = request.Description;
        plan.WeekDuration = request.WeekDuration;
        plan.IsActive = request.IsActive;
        plan.UpdatedAt = DateTime.UtcNow;

        try
        {

            await _db.SaveChangesAsync();

        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An unexpected error occurred.", details = ex.Message });
        }

        return Ok(new { message = "Workout plan updated successfully." });
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
            return NotFound(new{error = "Workout plan not found"});
        }

        _db.WorkoutPlans.Remove(plan);
        await _db.SaveChangesAsync();

        return Ok(new {message="Workout plan successfully deleted" });
    }
}
