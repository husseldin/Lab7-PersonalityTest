using Microsoft.EntityFrameworkCore;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Infrastructure.Data;

namespace PersonalityTest.Infrastructure.Repositories;

public class FileRepository : IFileRepository
{
    private readonly AppDbContext _context;

    public FileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Domain.Entities.File?> GetByIdAsync(Guid id)
    {
        return await _context.Files
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<Domain.Entities.File> CreateAsync(Domain.Entities.File file)
    {
        _context.Files.Add(file);
        await _context.SaveChangesAsync();
        return file;
    }

    public async Task<IEnumerable<Domain.Entities.File>> GetUserFilesAsync(Guid userId)
    {
        return await _context.Files
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }
}
