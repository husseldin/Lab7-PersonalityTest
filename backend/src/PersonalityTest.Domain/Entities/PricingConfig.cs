using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class PricingConfig : BaseEntity
{
    public required EntitlementType ProductType { get; set; }
    public required int PriceInCents { get; set; }
    public string Currency { get; set; } = "USD";
    public string? StripePriceId { get; set; }
    public bool IsActive { get; set; }
}
