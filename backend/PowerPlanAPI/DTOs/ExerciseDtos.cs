namespace PowerPlanAPI.DTOs;

public record CreateExerciseRequest(
    string OrderNumber,
    string Name,
    int Sets,
    int Reps,
    string Tempo,
    int RestSeconds,
    string? Notes,
    string? VideoUrl,
    string? Description
);

public record UpdateExerciseRequest(
    string OrderNumber,
    string Name,
    int Sets,
    int Reps,
    string Tempo,
    int RestSeconds,
    string? Notes,
    string? VideoUrl,
    string? Description
);
