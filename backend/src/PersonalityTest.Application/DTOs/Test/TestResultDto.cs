namespace PersonalityTest.Application.DTOs.Test;

public class TestResultDto
{
    public required Guid AttemptId { get; set; }
    public required string PersonalityType { get; set; }
    public required string TypeName { get; set; }
    public required string TypeDescription { get; set; }
    public required DateTime CompletedAt { get; set; }
    public required ScoreBreakdownDto Scores { get; set; }
    public required bool HasCompleteReport { get; set; }
}

public class ScoreBreakdownDto
{
    public required int ScoreE { get; set; }
    public required int ScoreI { get; set; }
    public required int ScoreS { get; set; }
    public required int ScoreN { get; set; }
    public required int ScoreT { get; set; }
    public required int ScoreF { get; set; }
    public required int ScoreJ { get; set; }
    public required int ScoreP { get; set; }
}
