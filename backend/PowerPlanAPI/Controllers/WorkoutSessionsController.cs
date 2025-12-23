using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Data;
using PowerPlanAPI.DTOs.WorkoutSession;
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

    private static int CalculateCurrentWeek(DateTime planCreatedAtUtc, int weekDuration, DateTime nowUtc)
    {
        var startDate = planCreatedAtUtc.Date;
        var nowDate = nowUtc.Date;
        var daysDiff = (nowDate - startDate).Days;

        var week = daysDiff <= 0 ? 1 : (daysDiff / 7) + 1;
        if (weekDuration > 0)
        {
            week = Math.Min(week, weekDuration);
        }
        return week;
    }

    private static WorkoutSessionDTO ToDto(WorkoutSession s)
    {
        return new WorkoutSessionDTO
        {
            Id = s.Id,
            WorkoutPlanId = s.WorkoutPlanId,
            TrainingDayId = s.TrainingDayId,
            WeekNumber = s.WeekNumber,
            IsCompleted = s.IsCompleted,
            CompletedAt = s.CompletedAt,
            Notes = s.Notes,
            WorkoutPlanName = s.WorkoutPlan?.Name ?? string.Empty,
            TrainingDayName = s.TrainingDay?.Name ?? string.Empty,
            ExerciseLogs = s.ExerciseLogs
                .Select(el => new ExerciseLogDTO
                {
                    Id = el.Id,
                    ExerciseId = el.ExerciseId,
                    ExerciseName = el.Exercise?.Name ?? string.Empty,
                    StartingWeight = el.StartingWeight,
                    IsCompleted = el.IsCompleted,
                    Notes = el.Notes,
                    Feeling = el.Feeling,
                    NextPreference = el.NextPreference?.ToString()
                })
                .ToList()
        };
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
            .Include(s => s.ExerciseLogs)
                .ThenInclude(el => el.Exercise)
            .Where(s => s.WorkoutPlan.UserId == userId && s.IsCompleted == false);

        if (!string.IsNullOrEmpty(workoutPlanId))
        {
            query = query.Where(s => s.WorkoutPlanId == workoutPlanId);
        }

        var sessions = await query.ToListAsync();
        return Ok(sessions.Select(ToDto).ToList());
    }

    // GET /api/sessions/history
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<WorkoutSessionDTO>>> GetSessionsHistory([FromQuery] string? workoutPlanId)
    {
        var userId = GetCurrentUserId();

        var query = _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Include(s => s.TrainingDay)
            .Include(s => s.ExerciseLogs)
                .ThenInclude(el => el.Exercise)
            .Where(s => s.WorkoutPlan.UserId == userId && s.IsCompleted == true);

        if (!string.IsNullOrEmpty(workoutPlanId))
        {
            query = query.Where(s => s.WorkoutPlanId == workoutPlanId);
        }

        var sessions = await query
            .OrderByDescending(s => s.CompletedAt)
            .ToListAsync();

        return Ok(sessions.Select(ToDto).ToList());
    }

    // GET /api/sessions/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkoutSessionDTO>> GetSessionById(string id)
    {
        var userId = GetCurrentUserId();

        var session = await _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Include(s => s.TrainingDay)
            .Include(s => s.ExerciseLogs)
                .ThenInclude(el => el.Exercise)
            .FirstOrDefaultAsync(s =>
                s.Id == id &&
                s.WorkoutPlan.UserId == userId);

        if (session == null)
            return NotFound();

        return Ok(ToDto(session));
    }

    // GET /api/sessions/suggest-weights?workoutPlanId=xxx&trainingDayId=yyy&weekNumber=3
    [HttpGet("suggest-weights")]
    public async Task<ActionResult<IEnumerable<ExerciseWeightSuggestionDTO>>> GetSuggestedWeights(
        [FromQuery] string workoutPlanId,
        [FromQuery] string trainingDayId,
        [FromQuery] int weekNumber)
    {
        var userId = GetCurrentUserId();

        var plan = await _db.WorkoutPlans
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == workoutPlanId && p.UserId == userId);

        if (plan == null)
            return BadRequest(new { error = "Workout plan not found or not owned by user." });

        var trainingDay = await _db.TrainingDays
            .AsNoTracking()
            .FirstOrDefaultAsync(td => td.Id == trainingDayId && td.WorkoutPlanId == workoutPlanId);

        if (trainingDay == null)
            return BadRequest(new { error = "Training day not found for this plan." });

        var exerciseIds = await _db.Exercises
            .AsNoTracking()
            .Where(e => e.TrainingDayId == trainingDayId)
            .Select(e => e.Id)
            .ToListAsync();

        if (exerciseIds.Count == 0)
            return Ok(new List<ExerciseWeightSuggestionDTO>());

        // Pull all logs from earlier weeks for this day/plan.
        var logs = await _db.ExerciseLogs
            .AsNoTracking()
            .Include(el => el.WorkoutSession)
                .ThenInclude(ws => ws.WorkoutPlan)
            .Where(el => exerciseIds.Contains(el.ExerciseId))
            .Where(el => el.WorkoutSession.WorkoutPlanId == workoutPlanId)
            .Where(el => el.WorkoutSession.TrainingDayId == trainingDayId)
            .Where(el => el.WorkoutSession.IsCompleted)
            .Where(el => el.WorkoutSession.WorkoutPlan.UserId == userId)
            .Where(el => el.WorkoutSession.WeekNumber < weekNumber)
            .Select(el => new
            {
                el.ExerciseId,
                el.StartingWeight,
                el.WorkoutSession.WeekNumber,
                el.WorkoutSession.CompletedAt
            })
            .ToListAsync();

        var prevWeek = weekNumber - 1;

        var suggestions = new List<ExerciseWeightSuggestionDTO>(exerciseIds.Count);
        foreach (var exId in exerciseIds)
        {
            var fromPrevWeek = logs
                .Where(l => l.ExerciseId == exId && l.WeekNumber == prevWeek)
                .OrderByDescending(l => l.CompletedAt ?? DateTime.MinValue)
                .FirstOrDefault();

            var fallback = logs
                .Where(l => l.ExerciseId == exId)
                .OrderByDescending(l => l.WeekNumber)
                .ThenByDescending(l => l.CompletedAt ?? DateTime.MinValue)
                .FirstOrDefault();

            suggestions.Add(new ExerciseWeightSuggestionDTO
            {
                ExerciseId = exId,
                SuggestedWeight = fromPrevWeek?.StartingWeight ?? fallback?.StartingWeight
            });
        }

        return Ok(suggestions);
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
            .FirstOrDefaultAsync(p => p.Id == request.TrainingDayId && p.WorkoutPlanId == plan.Id);

        if (trainingDay == null)
            return BadRequest("Training day not found.");

        var computedWeek = CalculateCurrentWeek(plan.CreatedAt, plan.WeekDuration, DateTime.UtcNow);

        var session = new WorkoutSession
        {
            Id = Guid.NewGuid().ToString(),
            WorkoutPlanId = request.WorkoutPlanId,
            TrainingDayId = request.TrainingDayId,
            WeekNumber = computedWeek,
            IsCompleted = false,
            CompletedAt = null,
            Notes = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            WorkoutPlan = plan,
            TrainingDay = trainingDay
        };

        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSessionById), new { id = session.Id }, ToDto(session));
    }

    // POST /api/sessions/complete/{id}
    [HttpPost("complete/{id}")]
    public async Task<ActionResult<WorkoutSessionDTO>> CompleteSession(string id, [FromBody] CompleteWorkoutSessionDTO request)
    {
        var userId = GetCurrentUserId();

        var session = await _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Include(s => s.TrainingDay)
            .Include(s => s.ExerciseLogs)
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

        var validExerciseIds = await _db.Exercises
            .AsNoTracking()
            .Where(e => e.TrainingDayId == session.TrainingDayId)
            .Select(e => e.Id)
            .ToListAsync();

        var validSet = validExerciseIds.ToHashSet();
        if (request.ExerciseLogs.Any(l => !validSet.Contains(l.ExerciseId)))
        {
            return BadRequest(new { error = "One or more exerciseIds do not belong to this training day." });
        }

        // Avoid duplicates if client retries before completion is marked.
        if (session.ExerciseLogs.Any())
        {
            _db.ExerciseLogs.RemoveRange(session.ExerciseLogs);
        }

        foreach (var log in request.ExerciseLogs)
        {
            NextWeightPreference? pref = null;
            if (!string.IsNullOrWhiteSpace(log.NextPreference) && Enum.TryParse<NextWeightPreference>(log.NextPreference, true, out var parsed))
            {
                pref = parsed;
            }

            _db.ExerciseLogs.Add(new ExerciseLog
            {
                Id = Guid.NewGuid().ToString(),
                WorkoutSessionId = session.Id,
                ExerciseId = log.ExerciseId,
                StartingWeight = log.StartingWeight,
                IsCompleted = log.IsCompleted,
                Notes = log.Notes,
                Feeling = log.Feeling,
                NextPreference = pref,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        session.IsCompleted = true;
        session.CompletedAt = DateTime.UtcNow;
        session.Notes = request.Notes;
        session.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Reload with logs + exercise names for DTO.
        var completed = await _db.WorkoutSessions
            .Include(s => s.WorkoutPlan)
            .Include(s => s.TrainingDay)
            .Include(s => s.ExerciseLogs)
                .ThenInclude(el => el.Exercise)
            .FirstAsync(s => s.Id == session.Id);

        return Ok(ToDto(completed));
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
