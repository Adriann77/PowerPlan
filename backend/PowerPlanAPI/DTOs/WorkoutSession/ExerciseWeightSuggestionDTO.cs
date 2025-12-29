namespace PowerPlanAPI.DTOs.WorkoutSession;

public class ExerciseWeightSuggestionDTO
{
    public string ExerciseId { get; set; } = string.Empty;
    public decimal? SuggestedWeight { get; set; }
}
