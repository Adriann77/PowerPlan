namespace PowerPlanAPI.Models;

public class WorkoutSession
{
    public string Id { get; set; } = string.Empty;
    public string WorkoutPlanId { get; set; } = string.Empty;
    public string TrainingDayId { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsCompleted { get; set; } = false;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public WorkoutPlan WorkoutPlan { get; set; } = null!;
    public TrainingDay TrainingDay { get; set; } = null!;
    public ICollection<ExerciseLog> ExerciseLogs { get; set; } = new List<ExerciseLog>();
} 