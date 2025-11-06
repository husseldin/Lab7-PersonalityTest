using Microsoft.EntityFrameworkCore;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Infrastructure.Data;

namespace PersonalityTest.Infrastructure.Repositories;

public class InvitationRepository : IInvitationRepository
{
    private readonly AppDbContext _context;

    public InvitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Invitation?> GetByIdAsync(Guid id)
    {
        return await _context.Invitations
            .Include(i => i.Inviter)
            .Include(i => i.InviteeUser)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Invitation?> GetByInviteCodeAsync(string inviteCode)
    {
        return await _context.Invitations
            .Include(i => i.Inviter)
            .Include(i => i.InviteeUser)
            .FirstOrDefaultAsync(i => i.InviteCode == inviteCode);
    }

    public async Task<IEnumerable<Invitation>> GetUserInvitationsAsync(Guid inviterId, int skip, int take)
    {
        return await _context.Invitations
            .Where(i => i.InviterId == inviterId)
            .OrderByDescending(i => i.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<Invitation> CreateAsync(Invitation invitation)
    {
        _context.Invitations.Add(invitation);
        await _context.SaveChangesAsync();
        return invitation;
    }

    public async Task UpdateAsync(Invitation invitation)
    {
        _context.Invitations.Update(invitation);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasExistingInvitationAsync(Guid inviterId, string inviteeEmail)
    {
        return await _context.Invitations
            .AnyAsync(i => i.InviterId == inviterId &&
                          i.InviteeEmail == inviteeEmail &&
                          i.Status == Domain.Enums.InvitationStatus.Pending);
    }
}
