using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Application.Interfaces;

public interface IEntitlementRepository
{
    Task<Entitlement?> GetByAttemptIdAsync(Guid attemptId, EntitlementType type);
    Task<Entitlement> CreateAsync(Entitlement entitlement);
    Task<IEnumerable<Entitlement>> GetUserEntitlementsAsync(Guid userId);
}
