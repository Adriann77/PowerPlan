public class WorkoutPlanDTO
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int WeekDuration { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Optional convenience fields
    public int TrainingDaysCount { get; set; }
    public int WorkoutSessionsCount { get; set; }
}