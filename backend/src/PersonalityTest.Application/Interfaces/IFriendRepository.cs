using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface IFriendRepository
{
    Task<FriendLink?> GetFriendLinkAsync(Guid userId, Guid friendUserId);
    Task<IEnumerable<FriendLink>> GetUserFriendsAsync(Guid userId);
    Task<FriendLink> CreateAsync(FriendLink friendLink);
    Task UpdateAsync(FriendLink friendLink);
}
