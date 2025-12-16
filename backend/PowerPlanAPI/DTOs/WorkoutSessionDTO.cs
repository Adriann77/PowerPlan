public class WorkoutSessionDTO
{
    public string Id { get; set; } = string.Empty;
    public string WorkoutPlanId { get; set; } = string.Empty;
    public string TrainingDayId { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }

    public string WorkoutPlanName { get; set; } = string.Empty;
    public string TrainingDayName { get; set; } = string.Empty;
}
