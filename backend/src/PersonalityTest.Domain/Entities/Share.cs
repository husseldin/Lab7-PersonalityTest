using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class Share : BaseEntity
{
    public required Guid UserId { get; set; }
    public required Guid AttemptId { get; set; }
    public required string ShareCode { get; set; }
    public SharePrivacy Privacy { get; set; } = SharePrivacy.Unlisted;
    public int ViewCount { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public TestAttempt? Attempt { get; set; }
}
