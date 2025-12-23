namespace PowerPlanAPI.DTOs.WorkoutSession;

public class ExerciseLogDTO
{
    public string Id { get; set; } = string.Empty;
    public string ExerciseId { get; set; } = string.Empty;
    public string ExerciseName { get; set; } = string.Empty;
    public decimal? StartingWeight { get; set; }
    public bool IsCompleted { get; set; }
    public string? Notes { get; set; }
    public int? Feeling { get; set; }
    public string? NextPreference { get; set; }
}
