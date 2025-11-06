namespace PersonalityTest.Application.DTOs.Test;

public class AttemptHistoryDto
{
    public required Guid Id { get; set; }
    public required DateTime CompletedAt { get; set; }
    public required string PersonalityType { get; set; }
    public required string TypeName { get; set; }
    public required bool HasCompleteReport { get; set; }
    public string? ShareCode { get; set; }
}
