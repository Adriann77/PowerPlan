public class UpdateWorkoutPlanDTO
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int WeekDuration { get; set; } = 5;
    public bool IsActive { get; set; } = false;
}