using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.Models;
using System.Security.Claims;

namespace PowerPlanAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
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

    // GET /api/workoutsessions?workoutPlanId=xxx
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkoutSession>>> GetSessions(
        [FromQuery] string? workoutPlanId)
    {
        var userId = GetCurrentUserId();

        var query = _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Where(s => s.WorkoutPlan.UserId == userId);

        if (!string.IsNullOrEmpty(workoutPlanId))
        {
            query = query.Where(s => s.WorkoutPlanId == workoutPlanId);
        }

        var sessions = await query.ToListAsync();
        return Ok(sessions);
    }

    // GET /api/workoutsessions/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkoutSession>> GetSessionById(string id)
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

        return Ok(session);
    }

    // POST /api/workoutsessions
    [HttpPost]
    public async Task<ActionResult<WorkoutSession>> CreateSession(
        [FromBody] WorkoutSession request)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .FirstOrDefaultAsync(p =>
                p.Id == request.WorkoutPlanId );

        if (plan == null)
        {
            return BadRequest("Workout plan not found or not owned by user.");
        }

        var TrainingDay = await _db.TrainingDays
            .FirstOrDefaultAsync(p =>
                p.Id == request.TrainingDayId &&
                p.UserId == userId);

        if (TrainingDay == null)
        {
            return BadRequest("Training day not found or not owned by user.");
        }
        

        
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
            TrainingDay = TrainingDay

        };

        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSessionById),
            new { id = session.Id },
            session
        );
    }

    // PUT /api/workoutsessions/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(
        string id,
        [FromBody] WorkoutSession request)
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

        session.TrainingDayId = request.TrainingDayId;
        session.WeekNumber = request.WeekNumber;
        session.IsCompleted = request.IsCompleted;
        session.CompletedAt = request.IsCompleted
            ? session.CompletedAt ?? DateTime.UtcNow
            : null;
        session.Notes = request.Notes;
        session.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/workoutsessions/{id}
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

        return NoContent();
    }
}
