using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface IShareRepository
{
    Task<Share?> GetByShareCodeAsync(string shareCode);
    Task<Share?> GetByAttemptIdAsync(Guid attemptId);
    Task<Share> CreateAsync(Share share);
    Task UpdateAsync(Share share);
    Task DeleteAsync(Guid id);
}
