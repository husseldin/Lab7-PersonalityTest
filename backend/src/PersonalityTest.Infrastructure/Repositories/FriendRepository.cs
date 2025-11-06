using Microsoft.EntityFrameworkCore;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Infrastructure.Data;

namespace PersonalityTest.Infrastructure.Repositories;

public class FriendRepository : IFriendRepository
{
    private readonly AppDbContext _context;

    public FriendRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FriendLink?> GetFriendLinkAsync(Guid userId, Guid friendUserId)
    {
        return await _context.FriendLinks
            .FirstOrDefaultAsync(fl => fl.UserId == userId && fl.FriendUserId == friendUserId);
    }

    public async Task<IEnumerable<FriendLink>> GetUserFriendsAsync(Guid userId)
    {
        return await _context.FriendLinks
            .Where(fl => fl.UserId == userId && fl.ConsentGiven)
            .OrderByDescending(fl => fl.CreatedAt)
            .ToListAsync();
    }

    public async Task<FriendLink> CreateAsync(FriendLink friendLink)
    {
        _context.FriendLinks.Add(friendLink);
        await _context.SaveChangesAsync();
        return friendLink;
    }

    public async Task UpdateAsync(FriendLink friendLink)
    {
        _context.FriendLinks.Update(friendLink);
        await _context.SaveChangesAsync();
    }
}
