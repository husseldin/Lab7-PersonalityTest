using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Application.Interfaces;

public interface IPricingConfigRepository
{
    Task<PricingConfig?> GetActiveConfigAsync(EntitlementType productType);
    Task<IEnumerable<PricingConfig>> GetAllActiveAsync();
}
