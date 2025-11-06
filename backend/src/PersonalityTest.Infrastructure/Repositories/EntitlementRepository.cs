using Microsoft.EntityFrameworkCore;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.Enums;
using PersonalityTest.Infrastructure.Data;

namespace PersonalityTest.Infrastructure.Repositories;

public class EntitlementRepository : IEntitlementRepository
{
    private readonly AppDbContext _context;

    public EntitlementRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Entitlement?> GetByAttemptIdAsync(Guid attemptId, EntitlementType type)
    {
        return await _context.Entitlements
            .FirstOrDefaultAsync(e => e.AttemptId == attemptId && e.EntitlementType == type);
    }

    public async Task<Entitlement> CreateAsync(Entitlement entitlement)
    {
        _context.Entitlements.Add(entitlement);
        await _context.SaveChangesAsync();
        return entitlement;
    }

    public async Task<IEnumerable<Entitlement>> GetUserEntitlementsAsync(Guid userId)
    {
        return await _context.Entitlements
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.GrantedAt)
            .ToListAsync();
    }
}
