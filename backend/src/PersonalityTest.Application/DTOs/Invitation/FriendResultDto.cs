namespace PersonalityTest.Application.DTOs.Invitation;

public class FriendResultDto
{
    public required Guid FriendUserId { get; set; }
    public required string FriendName { get; set; }
    public string? PersonalityType { get; set; }
    public string? TypeName { get; set; }
    public DateTime? LastTestDate { get; set; }
}
