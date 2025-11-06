using Microsoft.EntityFrameworkCore;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Infrastructure.Data;

namespace PersonalityTest.Infrastructure.Repositories;

public class ShareRepository : IShareRepository
{
    private readonly AppDbContext _context;

    public ShareRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Share?> GetByShareCodeAsync(string shareCode)
    {
        return await _context.Shares
            .Include(s => s.User)
            .Include(s => s.Attempt)
            .FirstOrDefaultAsync(s => s.ShareCode == shareCode);
    }

    public async Task<Share?> GetByAttemptIdAsync(Guid attemptId)
    {
        return await _context.Shares
            .FirstOrDefaultAsync(s => s.AttemptId == attemptId);
    }

    public async Task<Share> CreateAsync(Share share)
    {
        _context.Shares.Add(share);
        await _context.SaveChangesAsync();
        return share;
    }

    public async Task UpdateAsync(Share share)
    {
        _context.Shares.Update(share);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var share = await _context.Shares.FindAsync(id);
        if (share != null)
        {
            _context.Shares.Remove(share);
            await _context.SaveChangesAsync();
        }
    }
}
