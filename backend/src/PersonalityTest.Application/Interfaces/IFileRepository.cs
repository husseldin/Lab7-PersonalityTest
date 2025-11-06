using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface IFileRepository
{
    Task<Domain.Entities.File?> GetByIdAsync(Guid id);
    Task<Domain.Entities.File> CreateAsync(Domain.Entities.File file);
    Task<IEnumerable<Domain.Entities.File>> GetUserFilesAsync(Guid userId);
}
