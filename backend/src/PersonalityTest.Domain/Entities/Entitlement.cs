using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class Entitlement : BaseEntity
{
    public required Guid UserId { get; set; }
    public required Guid AttemptId { get; set; }
    public required EntitlementType EntitlementType { get; set; }
    public required DateTime GrantedAt { get; set; }
    public Guid? PaymentId { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public TestAttempt? Attempt { get; set; }
    public Payment? Payment { get; set; }
}
