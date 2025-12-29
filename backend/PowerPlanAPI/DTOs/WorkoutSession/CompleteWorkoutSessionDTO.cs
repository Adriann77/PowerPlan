namespace PowerPlanAPI.DTOs.WorkoutSession;

public class CompleteWorkoutSessionDTO
{
    public string? Notes { get; set; }
    public List<CompleteWorkoutSessionExerciseLogDTO> ExerciseLogs { get; set; } = new();
}

public class CompleteWorkoutSessionExerciseLogDTO
{
    public string ExerciseId { get; set; } = string.Empty;
    public decimal? StartingWeight { get; set; }
    public bool IsCompleted { get; set; } = false;
    public string? Notes { get; set; }
    public int? Feeling { get; set; }
    public string? NextPreference { get; set; }
}
