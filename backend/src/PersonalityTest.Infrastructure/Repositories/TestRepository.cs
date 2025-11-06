using Microsoft.EntityFrameworkCore;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Infrastructure.Data;

namespace PersonalityTest.Infrastructure.Repositories;

public class TestRepository : ITestRepository
{
    private readonly AppDbContext _context;

    public TestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<QuestionVersion?> GetActiveVersionAsync()
    {
        return await _context.QuestionVersions
            .FirstOrDefaultAsync(qv => qv.IsActive);
    }

    public async Task<QuestionVersion?> GetVersionByNameAsync(string versionName)
    {
        return await _context.QuestionVersions
            .FirstOrDefaultAsync(qv => qv.VersionName == versionName);
    }

    public async Task<IEnumerable<Question>> GetQuestionsByVersionAsync(Guid versionId)
    {
        return await _context.Questions
            .Where(q => q.VersionId == versionId)
            .OrderBy(q => q.OrderIndex)
            .ToListAsync();
    }

    public async Task<TestAttempt?> GetAttemptByIdAsync(Guid attemptId)
    {
        return await _context.TestAttempts
            .Include(t => t.User)
            .Include(t => t.QuestionVersion)
            .Include(t => t.TestAnswers)
            .Include(t => t.Entitlement)
            .FirstOrDefaultAsync(t => t.Id == attemptId);
    }

    public async Task<IEnumerable<TestAttempt>> GetUserAttemptsAsync(Guid userId, int skip, int take)
    {
        return await _context.TestAttempts
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CompletedAt ?? t.StartedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<TestAttempt> CreateAttemptAsync(TestAttempt attempt)
    {
        _context.TestAttempts.Add(attempt);
        await _context.SaveChangesAsync();
        return attempt;
    }

    public async Task UpdateAttemptAsync(TestAttempt attempt)
    {
        _context.TestAttempts.Update(attempt);
        await _context.SaveChangesAsync();
    }

    public async Task<TestAnswer?> GetAnswerAsync(Guid attemptId, Guid questionId)
    {
        return await _context.TestAnswers
            .FirstOrDefaultAsync(ta => ta.AttemptId == attemptId && ta.QuestionId == questionId);
    }

    public async Task SaveAnswerAsync(TestAnswer answer)
    {
        var existing = await GetAnswerAsync(answer.AttemptId, answer.QuestionId);
        if (existing != null)
        {
            existing.Answer = answer.Answer;
            _context.TestAnswers.Update(existing);
        }
        else
        {
            _context.TestAnswers.Add(answer);
        }
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<TestAnswer>> GetAttemptAnswersAsync(Guid attemptId)
    {
        return await _context.TestAnswers
            .Include(ta => ta.Question)
            .Where(ta => ta.AttemptId == attemptId)
            .ToListAsync();
    }
}
