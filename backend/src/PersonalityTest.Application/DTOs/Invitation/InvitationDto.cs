namespace PersonalityTest.Application.DTOs.Invitation;

public class InvitationDto
{
    public required Guid Id { get; set; }
    public required string InviteeEmail { get; set; }
    public required string InviteCode { get; set; }
    public required string Status { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
