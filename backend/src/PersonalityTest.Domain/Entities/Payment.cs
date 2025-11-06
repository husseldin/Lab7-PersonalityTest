using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class Payment : BaseEntity
{
    public required Guid UserId { get; set; }
    public required Guid AttemptId { get; set; }
    public required string StripePaymentIntentId { get; set; }
    public required decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    // Navigation properties
    public User? User { get; set; }
    public TestAttempt? Attempt { get; set; }
    public ICollection<Entitlement> Entitlements { get; set; } = new List<Entitlement>();
}
