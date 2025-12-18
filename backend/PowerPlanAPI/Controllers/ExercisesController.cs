using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.DTOs;
using PowerPlanAPI.Models;
using System.Security.Claims;

namespace PowerPlanAPI.Controllers;

[ApiController]
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
            throw new UnauthorizedAccessException("User id not found in token.");
        return userId;
    }

    // helper: sprawdza czy TrainingDay należy do usera (przez WorkoutPlan.UserId)
    private async Task<bool> IsTrainingDayOwnedByUser(string dayId, string userId)
    {
        var day = await _db.TrainingDays
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == dayId);

        if (day == null) return false;

        return await _db.WorkoutPlans
            .AsNoTracking()
            .AnyAsync(p => p.Id == day.WorkoutPlanId && p.UserId == userId);
    }

    // ============================
    // SCRUM-60: POST /api/trainingdays/{dayId}/exercises
    // ============================
    [HttpPost("api/trainingdays/{dayId}/exercises")]
    public async Task<ActionResult<Exercise>> CreateExercise(string dayId, [FromBody] CreateExerciseRequest req)
    {
        var userId = GetCurrentUserId();

        // ownership + existence day
        if (!await IsTrainingDayOwnedByUser(dayId, userId))
            return NotFound("TrainingDay not found or not owned by user.");

        // minimalna walidacja
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");

        var exercise = new Exercise
        {
            Id = Guid.NewGuid().ToString(),
            TrainingDayId = dayId,

            OrderNumber = req.OrderNumber,
            Name = req.Name,
            Sets = req.Sets,
            Reps = req.Reps,
            Tempo = req.Tempo,
            RestSeconds = req.RestSeconds,
            Notes = req.Notes,
            VideoUrl = req.VideoUrl,
            Description = req.Description,

            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Exercises.Add(exercise);
        await _db.SaveChangesAsync();

        return Created($"/api/exercises/{exercise.Id}", exercise);
    }

    // ============================
    // SCRUM-61: PUT /api/exercises/{id}
    // ============================
    [HttpPut("api/exercises/{id}")]
    public async Task<IActionResult> UpdateExercise(string id, [FromBody] UpdateExerciseRequest req)
    {
        var userId = GetCurrentUserId();

        var exercise = await _db.Exercises.FirstOrDefaultAsync(e => e.Id == id);
        if (exercise == null) return NotFound();

        // ownership przez TrainingDay
        if (!await IsTrainingDayOwnedByUser(exercise.TrainingDayId, userId))
            return Forbid();

        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");

        exercise.OrderNumber = req.OrderNumber;
        exercise.Name = req.Name;
        exercise.Sets = req.Sets;
        exercise.Reps = req.Reps;
        exercise.Tempo = req.Tempo;
        exercise.RestSeconds = req.RestSeconds;
        exercise.Notes = req.Notes;
        exercise.VideoUrl = req.VideoUrl;
        exercise.Description = req.Description;
        exercise.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ============================
    // SCRUM-62: DELETE /api/exercises/{id}
    // ============================
    [HttpDelete("api/exercises/{id}")]
    public async Task<IActionResult> DeleteExercise(string id)
    {
        var userId = GetCurrentUserId();

        var exercise = await _db.Exercises.FirstOrDefaultAsync(e => e.Id == id);
        if (exercise == null) return NotFound();

        if (!await IsTrainingDayOwnedByUser(exercise.TrainingDayId, userId))
            return Forbid();

        _db.Exercises.Remove(exercise);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
