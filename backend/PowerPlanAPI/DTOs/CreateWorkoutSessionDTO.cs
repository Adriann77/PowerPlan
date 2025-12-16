public class CreateWorkoutSessionDto
{
    public string WorkoutPlanId { get; set; } = string.Empty;
    public string TrainingDayId { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public bool IsCompleted { get; set; } = false;
    public string? Notes { get; set; }
}