using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.Models;
using System.Security.Claims;

namespace PowerPlanAPI.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize]
public class WorkoutSessionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkoutSessionsController(AppDbContext db)
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

    // GET /api/sessions?workoutPlanId=xxx
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkoutSessionDTO>>> GetSessions(
    [FromQuery] string? workoutPlanId)
    {
        var userId = GetCurrentUserId();

        var query = _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Include(s => s.TrainingDay)
            .Where(s => s.WorkoutPlan.UserId == userId && s.IsCompleted == false);

        if (!string.IsNullOrEmpty(workoutPlanId))
        {
            query = query.Where(s => s.WorkoutPlanId == workoutPlanId);
        }

        var sessions = await query.ToListAsync();

        // Map EF entities to DTOs
        var sessionDtos = sessions.Select(s => new WorkoutSessionDTO
        {
            Id = s.Id,
            WorkoutPlanId = s.WorkoutPlanId,
            TrainingDayId = s.TrainingDayId,
            WeekNumber = s.WeekNumber,
            IsCompleted = s.IsCompleted,
            CompletedAt = s.CompletedAt,
            Notes = s.Notes,
            WorkoutPlanName = s.WorkoutPlan.Name,
            TrainingDayName = s.TrainingDay.Name
        }).ToList();

        return Ok(sessionDtos);
    }

    // GET /api/sessions/history
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<WorkoutSessionDTO>>> GetSessionsHistory([FromQuery] string? workoutPlanId)
    {
        var userId = GetCurrentUserId();

        var query = _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Include(s => s.TrainingDay)
            .Where(s => s.WorkoutPlan.UserId == userId && s.IsCompleted == true);

        if (!string.IsNullOrEmpty(workoutPlanId))
        {
            query = query.Where(s => s.WorkoutPlanId == workoutPlanId);
        }

        var sessions = await query.ToListAsync();

        // Map EF entities to DTOs
        var sessionDtos = sessions.Select(s => new WorkoutSessionDTO
        {
            Id = s.Id,
            WorkoutPlanId = s.WorkoutPlanId,
            TrainingDayId = s.TrainingDayId,
            WeekNumber = s.WeekNumber,
            IsCompleted = s.IsCompleted,
            CompletedAt = s.CompletedAt,
            Notes = s.Notes,
            WorkoutPlanName = s.WorkoutPlan.Name,
            TrainingDayName = s.TrainingDay.Name
        }).ToList();

        return Ok(sessionDtos);
    }

    // GET /api/sessions/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkoutSessionDTO>> GetSessionById(string id)
    {
        var userId = GetCurrentUserId();

        var session = await _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Include(s => s.TrainingDay)
            .FirstOrDefaultAsync(s =>
                s.Id == id &&
                s.WorkoutPlan.UserId == userId);

        if (session == null)
            return NotFound();

        var sessionDto = new WorkoutSessionDTO
        {
            Id = session.Id,
            WorkoutPlanId = session.WorkoutPlanId,
            TrainingDayId = session.TrainingDayId,
            WeekNumber = session.WeekNumber,
            IsCompleted = session.IsCompleted,
            CompletedAt = session.CompletedAt,
            Notes = session.Notes,
            WorkoutPlanName = session.WorkoutPlan.Name,
            TrainingDayName = session.TrainingDay.Name
        };

        return Ok(sessionDto);
    }

    // POST /api/sessions/start
    [HttpPost("start")]
    public async Task<ActionResult<WorkoutSession>> CreateSession(
    [FromBody] CreateWorkoutSessionDto request)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p =>
                p.Id == request.WorkoutPlanId &&
                p.UserId == userId);

        if (plan == null)
            return BadRequest("Workout plan not found or not owned by user.");

        var trainingDay = await _db.TrainingDays
            .FirstOrDefaultAsync(p => p.Id == request.TrainingDayId);

        if (trainingDay == null)
            return BadRequest("Training day not found.");

        var session = new WorkoutSession
        {
            Id = Guid.NewGuid().ToString(),
            WorkoutPlanId = request.WorkoutPlanId,
            TrainingDayId = request.TrainingDayId,
            WeekNumber = request.WeekNumber,
            IsCompleted = request.IsCompleted,
            CompletedAt = request.IsCompleted ? DateTime.UtcNow : null,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            WorkoutPlan = plan,
            TrainingDay = trainingDay
        };

        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSessionById), new { id = session.Id }, new WorkoutSessionDTO
        {
            Id = session.Id,
            WorkoutPlanId = session.WorkoutPlanId,
            TrainingDayId = session.TrainingDayId,
            WeekNumber = session.WeekNumber,
            IsCompleted = session.IsCompleted,
            CompletedAt = session.CompletedAt,
            Notes = session.Notes,
            WorkoutPlanName = session.WorkoutPlan.Name,
            TrainingDayName = session.TrainingDay.Name
        });
    }

    // POST /api/sessions/complete/{id}
    [HttpPost("complete/{id}")]
    public async Task<IActionResult> UpdateSession(string id)
    {
        var userId = GetCurrentUserId();

        var session = await _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .FirstOrDefaultAsync(s =>
                s.Id == id &&
                s.WorkoutPlan.UserId == userId);

        if (session == null)
        {
            return NotFound(new { message = "Work session not found" });
        }

        if (session.IsCompleted == true)
        {
            return BadRequest(new { error = "Session already completed" });
        }

        session.IsCompleted = true;
        session.CompletedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Workout Session successfully completed!" });
    }

    // PUT /api/sessions/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(
    string id,
    [FromBody] UpdateWorkoutSessionDTO request)
    {
        var userId = GetCurrentUserId();

        var session = await _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .FirstOrDefaultAsync(s =>
                s.Id == id &&
                s.WorkoutPlan.UserId == userId);

        if (session == null)
        {
            return NotFound(new { message = "Workout session not found" });
        }

        // Update only allowed fields
        session.TrainingDayId = request.TrainingDayId;
        session.WeekNumber = request.WeekNumber;
        session.IsCompleted = request.IsCompleted;
        session.CompletedAt = request.IsCompleted
            ? session.CompletedAt ?? DateTime.UtcNow
            : null;
        session.Notes = request.Notes;
        session.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Workout Session successfully updated!" });
    }



    // DELETE /api/sessions/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(string id)
    {
        var userId = GetCurrentUserId();

        var session = await _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .FirstOrDefaultAsync(s =>
                s.Id == id &&
                s.WorkoutPlan.UserId == userId);

        if (session == null)
        {
            return NotFound();
        }

        _db.WorkoutSessions.Remove(session);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Workout session successfully deleted!" });
    }
}
