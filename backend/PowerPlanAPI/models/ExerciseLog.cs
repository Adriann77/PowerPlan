namespace PowerPlanAPI.Models;

public enum NextWeightPreference
{
    GAIN,
    LOWER,
    STAY
}

public class ExerciseLog
{
    public string Id { get; set; } = string.Empty;
    public string WorkoutSessionId { get; set; } = string.Empty;
    public string ExerciseId { get; set; } = string.Empty;
    public decimal? StartingWeight { get; set; }
    public bool IsCompleted { get; set; } = false;
    public string? Notes { get; set; }
    public int? Feeling { get; set; }
    public NextWeightPreference? NextPreference { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public WorkoutSession WorkoutSession { get; set; } = null!;
    public Exercise Exercise { get; set; } = null!;
}