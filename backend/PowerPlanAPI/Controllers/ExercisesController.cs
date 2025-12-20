using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.Models;
using System.Security.Claims;

namespace PowerPlanAPI.Controllers;

[ApiController]
[Route("api/trainingdays/{trainingDayId}/exercises")]
[Authorize]
public class ExercisesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExercisesController(AppDbContext db)
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

    // GET /api/trainingdays/{trainingDayId}/exercises
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Exercise>>> GetExercises(string trainingDayId)
    {
        var userId = GetCurrentUserId();

        var trainingDay = await _db.TrainingDays
            .Include(td => td.WorkoutPlan)
            .FirstOrDefaultAsync(td => td.Id == trainingDayId);

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        if (trainingDay.WorkoutPlan.UserId != userId)
            return Forbid();

        var exercises = await _db.Exercises
            .Where(e => e.TrainingDayId == trainingDayId)
            .OrderBy(e => e.OrderNumber)
            .Select(e => new 
            {
                e.Id,
                e.TrainingDayId,
                e.OrderNumber,
                e.Name,
                e.Sets,
                e.Reps,
                e.Tempo,
                e.RestSeconds,
                e.Notes,
                e.VideoUrl,
                e.Description,
                e.CreatedAt,
                e.UpdatedAt
            })
            .ToListAsync();

        return Ok(exercises);
    }

    // GET /api/trainingdays/{trainingDayId}/exercises/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Exercise>> GetExercise(string trainingDayId, string id)
    {
        var userId = GetCurrentUserId();

        var trainingDay = await _db.TrainingDays
            .Include(td => td.WorkoutPlan)
            .FirstOrDefaultAsync(td => td.Id == trainingDayId);

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        if (trainingDay.WorkoutPlan.UserId != userId)
            return Forbid();

        var exercise = await _db.Exercises
            .FirstOrDefaultAsync(e => e.Id == id && e.TrainingDayId == trainingDayId);

        if (exercise == null)
            return NotFound(new { error = "Exercise not found" });

        return Ok(exercise);
    }

    // POST /api/trainingdays/{trainingDayId}/exercises
    [HttpPost]
    public async Task<ActionResult<Exercise>> CreateExercise(string trainingDayId, [FromBody] CreateExerciseRequest request)
    {
        var userId = GetCurrentUserId();

        var trainingDay = await _db.TrainingDays
            .Include(td => td.WorkoutPlan)
            .FirstOrDefaultAsync(td => td.Id == trainingDayId);

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        if (trainingDay.WorkoutPlan.UserId != userId)
            return Forbid();

        var exercise = new Exercise
        {
            Id = Guid.NewGuid().ToString(),
            TrainingDayId = trainingDayId,
            Name = request.Name,
            Sets = request.Sets,
            Reps = request.Reps,
            Tempo = request.Tempo ?? "3-1-1-0",
            RestSeconds = request.RestSeconds,
            Notes = request.Notes,
            OrderNumber = request.OrderNumber.ToString(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Exercises.Add(exercise);
        await _db.SaveChangesAsync();

        var result = new 
        {
            exercise.Id,
            exercise.TrainingDayId,
            exercise.OrderNumber,
            exercise.Name,
            exercise.Sets,
            exercise.Reps,
            exercise.Tempo,
            exercise.RestSeconds,
            exercise.Notes,
            exercise.VideoUrl,
            exercise.Description,
            exercise.CreatedAt,
            exercise.UpdatedAt
        };

        return CreatedAtAction(nameof(GetExercise), new { trainingDayId, id = exercise.Id }, result);
    }

    // PUT /api/trainingdays/{trainingDayId}/exercises/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExercise(string trainingDayId, string id, [FromBody] UpdateExerciseRequest request)
    {
        var userId = GetCurrentUserId();

        var trainingDay = await _db.TrainingDays
            .Include(td => td.WorkoutPlan)
            .FirstOrDefaultAsync(td => td.Id == trainingDayId);

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        if (trainingDay.WorkoutPlan.UserId != userId)
            return Forbid();

        var exercise = await _db.Exercises
            .FirstOrDefaultAsync(e => e.Id == id && e.TrainingDayId == trainingDayId);

        if (exercise == null)
            return NotFound(new { error = "Exercise not found" });

        exercise.Name = request.Name;
        exercise.Sets = request.Sets;
        exercise.Reps = request.Reps;
        exercise.Tempo = request.Tempo ?? exercise.Tempo;
        exercise.RestSeconds = request.RestSeconds;
        exercise.Notes = request.Notes;
        exercise.OrderNumber = request.OrderNumber.ToString();
        exercise.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(exercise);
    }

    // DELETE /api/trainingdays/{trainingDayId}/exercises/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExercise(string trainingDayId, string id)
    {
        var userId = GetCurrentUserId();

        var trainingDay = await _db.TrainingDays
            .Include(td => td.WorkoutPlan)
            .FirstOrDefaultAsync(td => td.Id == trainingDayId);

        if (trainingDay == null)
            return NotFound(new { error = "Training day not found" });

        if (trainingDay.WorkoutPlan.UserId != userId)
            return Forbid();

        var exercise = await _db.Exercises
            .FirstOrDefaultAsync(e => e.Id == id && e.TrainingDayId == trainingDayId);

        if (exercise == null)
            return NotFound(new { error = "Exercise not found" });

        _db.Exercises.Remove(exercise);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Exercise deleted successfully" });
    }
}

public class CreateExerciseRequest
{
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public string? Tempo { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
    public int OrderNumber { get; set; }
}

public class UpdateExerciseRequest
{
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public string? Tempo { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
    public int OrderNumber { get; set; }
}
