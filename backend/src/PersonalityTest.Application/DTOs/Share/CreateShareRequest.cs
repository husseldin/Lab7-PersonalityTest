namespace PersonalityTest.Application.DTOs.Share;

public class CreateShareRequest
{
    public required Guid AttemptId { get; set; }
    public required string Privacy { get; set; } // Public, Unlisted, Private
}
