using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface IInvitationRepository
{
    Task<Invitation?> GetByIdAsync(Guid id);
    Task<Invitation?> GetByInviteCodeAsync(string inviteCode);
    Task<IEnumerable<Invitation>> GetUserInvitationsAsync(Guid inviterId, int skip, int take);
    Task<Invitation> CreateAsync(Invitation invitation);
    Task UpdateAsync(Invitation invitation);
    Task<bool> HasExistingInvitationAsync(Guid inviterId, string inviteeEmail);
}
