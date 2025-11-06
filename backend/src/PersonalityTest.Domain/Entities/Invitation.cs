using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class Invitation : BaseEntity
{
    public required Guid InviterId { get; set; }
    public required string InviteeEmail { get; set; }
    public Guid? InviteeUserId { get; set; }
    public required string InviteCode { get; set; }
    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;
    public DateTime? AcceptedAt { get; set; }
    public required DateTime ExpiresAt { get; set; }

    // Navigation properties
    public User? Inviter { get; set; }
    public User? InviteeUser { get; set; }
}
