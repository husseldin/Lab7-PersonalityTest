using Microsoft.EntityFrameworkCore;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.Enums;
using PersonalityTest.Infrastructure.Data;

namespace PersonalityTest.Infrastructure.Repositories;

public class PricingConfigRepository : IPricingConfigRepository
{
    private readonly AppDbContext _context;

    public PricingConfigRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PricingConfig?> GetActiveConfigAsync(EntitlementType productType)
    {
        return await _context.PricingConfigs
            .FirstOrDefaultAsync(pc => pc.ProductType == productType && pc.IsActive);
    }

    public async Task<IEnumerable<PricingConfig>> GetAllActiveAsync()
    {
        return await _context.PricingConfigs
            .Where(pc => pc.IsActive)
            .ToListAsync();
    }
}
