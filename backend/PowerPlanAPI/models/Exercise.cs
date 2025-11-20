namespace PowerPlanAPI.Models;

public class Exercise
{
    public string Id { get; set; } = string.Empty;
    public string TrainingDayId { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public string Tempo { get; set; } = string.Empty;
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
    public string? VideoUrl { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public TrainingDay TrainingDay { get; set; } = null!;
    public ICollection<ExerciseLog> ExerciseLogs { get; set; } = new List<ExerciseLog>();
}