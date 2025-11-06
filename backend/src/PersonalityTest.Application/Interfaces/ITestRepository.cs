using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface ITestRepository
{
    Task<QuestionVersion?> GetActiveVersionAsync();
    Task<QuestionVersion?> GetVersionByNameAsync(string versionName);
    Task<IEnumerable<Question>> GetQuestionsByVersionAsync(Guid versionId);
    Task<TestAttempt?> GetAttemptByIdAsync(Guid attemptId);
    Task<IEnumerable<TestAttempt>> GetUserAttemptsAsync(Guid userId, int skip, int take);
    Task<TestAttempt> CreateAttemptAsync(TestAttempt attempt);
    Task UpdateAttemptAsync(TestAttempt attempt);
    Task<TestAnswer?> GetAnswerAsync(Guid attemptId, Guid questionId);
    Task SaveAnswerAsync(TestAnswer answer);
    Task<IEnumerable<TestAnswer>> GetAttemptAnswersAsync(Guid attemptId);
}
