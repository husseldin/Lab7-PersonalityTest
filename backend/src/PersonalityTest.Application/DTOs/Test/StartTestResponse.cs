namespace PersonalityTest.Application.DTOs.Test;

public class StartTestResponse
{
    public required Guid AttemptId { get; set; }
    public required string Version { get; set; }
    public required List<QuestionDto> Questions { get; set; }
}
