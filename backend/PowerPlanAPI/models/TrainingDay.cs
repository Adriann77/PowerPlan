namespace PowerPlanAPI.Models;

public class TrainingDay
{
    public string Id { get; set; } = string.Empty;
    public string WorkoutPlanId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public WorkoutPlan WorkoutPlan { get; set; } = null!;
    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = new List<WorkoutSession>();
}