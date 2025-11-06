namespace PersonalityTest.Application.DTOs.Share;

public class PublicResultDto
{
    public required string PersonalityType { get; set; }
    public required string TypeName { get; set; }
    public required string TypeDescription { get; set; }
    public required string UserName { get; set; } // First name only
    public required DateTime CompletedAt { get; set; }
}
