using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.Models;
using System.Security.Claims;

namespace PowerPlanAPI.Controllers;

[ApiController]
[Route("api/workoutplans/{workoutPlanId}/trainingdays")]
[Authorize]
public class TrainingDaysController : ControllerBase
{
    private readonly AppDbContext _db;

    public TrainingDaysController(AppDbContext db)
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

    // GET /api/workoutplans/{workoutPlanId}/trainingdays
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TrainingDay>>> GetTrainingDays(string workoutPlanId)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == workoutPlanId && p.UserId == userId);

        if (plan == null)
            return NotFound(new { error = "Workout plan not found" });

        var trainingDays = await _db.TrainingDays
            .Where(td => td.WorkoutPlanId == workoutPlanId)
            .OrderBy(td => td.CreatedAt)
            .Select(td => new TrainingDay
            {
                Id = td.Id,
                WorkoutPlanId = td.WorkoutPlanId,
                Name = td.Name,
                Description = td.Description,
                CreatedAt = td.CreatedAt,
                UpdatedAt = td.UpdatedAt,
                Exercises = td.Exercises.OrderBy(e => e.OrderNumber).ToList()
            })
            .ToListAsync();

        return Ok(trainingDays);
    }

    // GET /api/workoutplans/{workoutPlanId}/trainingdays/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TrainingDay>> GetTrainingDay(string workoutPlanId, string id)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == workoutPlanId && p.UserId == userId);

        if (plan == null)
            return NotFound(new { error = "Workout plan not found" });

        var trainingDay = await _db.TrainingDays
            .Where(td => td.Id == id && td.WorkoutPlanId == workoutPlanId)
            .Select(td => new TrainingDay
            {
                Id = td.Id,
                WorkoutPlanId = td.WorkoutPlanId,
                Name = td.Name,
                Description = td.Description,
                CreatedAt = td.CreatedAt,
                UpdatedAt = td.UpdatedAt,
                Exercises = td.Exercises.OrderBy(e => e.OrderNumber).ToList()
            })
            .FirstOrDefaultAsync();

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        return Ok(trainingDay);
    }

    // POST /api/workoutplans/{workoutPlanId}/trainingdays
    [HttpPost]
    public async Task<ActionResult<TrainingDay>> CreateTrainingDay(string workoutPlanId, [FromBody] CreateTrainingDayRequest request)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == workoutPlanId && p.UserId == userId);

        if (plan == null)
            return NotFound(new { error = "Workout plan not found" });

        var trainingDay = new TrainingDay
        {
            Id = Guid.NewGuid().ToString(),
            WorkoutPlanId = workoutPlanId,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.TrainingDays.Add(trainingDay);
        await _db.SaveChangesAsync();

        var result = new 
        {
            trainingDay.Id,
            trainingDay.WorkoutPlanId,
            trainingDay.Name,
            trainingDay.Description,
            trainingDay.CreatedAt,
            trainingDay.UpdatedAt,
            Exercises = new List<object>()
        };

        return CreatedAtAction(nameof(GetTrainingDay), new { workoutPlanId, id = trainingDay.Id }, result);
    }

    // PUT /api/workoutplans/{workoutPlanId}/trainingdays/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTrainingDay(string workoutPlanId, string id, [FromBody] UpdateTrainingDayRequest request)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == workoutPlanId && p.UserId == userId);

        if (plan == null)
            return NotFound(new { error = "Workout plan not found" });

        var trainingDay = await _db.TrainingDays
            .FirstOrDefaultAsync(td => td.Id == id && td.WorkoutPlanId == workoutPlanId);

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        trainingDay.Name = request.Name;
        trainingDay.Description = request.Description;
        trainingDay.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var result = new 
        {
            trainingDay.Id,
            trainingDay.WorkoutPlanId,
            trainingDay.Name,
            trainingDay.Description,
            trainingDay.CreatedAt,
            trainingDay.UpdatedAt
        };

        return Ok(result);
    }

    // DELETE /api/workoutplans/{workoutPlanId}/trainingdays/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTrainingDay(string workoutPlanId, string id)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == workoutPlanId && p.UserId == userId);

        if (plan == null)
            return NotFound(new { error = "Workout plan not found" });

        var trainingDay = await _db.TrainingDays
            .FirstOrDefaultAsync(td => td.Id == id && td.WorkoutPlanId == workoutPlanId);

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        _db.TrainingDays.Remove(trainingDay);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Training day deleted successfully" });
    }
}

public class CreateTrainingDayRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateTrainingDayRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
