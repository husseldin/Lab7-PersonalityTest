using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface IScoringService
{
    Task<(string ResultType, int ScoreE, int ScoreI, int ScoreS, int ScoreN, int ScoreT, int ScoreF, int ScoreJ, int ScoreP)>
        CalculateScoresAsync(Guid attemptId);
}
