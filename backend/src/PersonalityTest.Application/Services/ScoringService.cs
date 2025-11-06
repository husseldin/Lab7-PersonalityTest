using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Enums;
using PersonalityTest.Domain.ValueObjects;

namespace PersonalityTest.Application.Services;

public class ScoringService : IScoringService
{
    private readonly ITestRepository _testRepository;

    public ScoringService(ITestRepository testRepository)
    {
        _testRepository = testRepository;
    }

    public async Task<(string ResultType, int ScoreE, int ScoreI, int ScoreS, int ScoreN,
                       int ScoreT, int ScoreF, int ScoreJ, int ScoreP)> CalculateScoresAsync(Guid attemptId)
    {
        var attempt = await _testRepository.GetAttemptByIdAsync(attemptId)
            ?? throw new ArgumentException("Attempt not found");

        var answers = await _testRepository.GetAttemptAnswersAsync(attemptId);
        var questions = await _testRepository.GetQuestionsByVersionAsync(attempt.QuestionVersionId);

        int scoreE = 0, scoreI = 0, scoreS = 0, scoreN = 0;
        int scoreT = 0, scoreF = 0, scoreJ = 0, scoreP = 0;

        foreach (var answer in answers)
        {
            var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question == null) continue;

            // Convert 1-5 Likert scale to -2 to +2 scoring
            // 1 = Strongly Disagree (-2), 2 = Disagree (-1), 3 = Neutral (0),
            // 4 = Agree (+1), 5 = Strongly Agree (+2)
            int score = (answer.Answer - 3) * (int)(question.Weight);

            // Apply direction: Positive direction adds to first letter, Negative to second
            if (question.Direction == Direction.Negative)
                score = -score;

            switch (question.Dimension)
            {
                case Dimension.EI:
                    if (score > 0) scoreE += score;
                    else scoreI += Math.Abs(score);
                    break;
                case Dimension.SN:
                    if (score > 0) scoreS += score;
                    else scoreN += Math.Abs(score);
                    break;
                case Dimension.TF:
                    if (score > 0) scoreT += score;
                    else scoreF += Math.Abs(score);
                    break;
                case Dimension.JP:
                    if (score > 0) scoreJ += score;
                    else scoreP += Math.Abs(score);
                    break;
            }
        }

        var personalityType = PersonalityType.FromScores(scoreE, scoreI, scoreS, scoreN,
                                                         scoreT, scoreF, scoreJ, scoreP);

        return (personalityType.Code, scoreE, scoreI, scoreS, scoreN, scoreT, scoreF, scoreJ, scoreP);
    }
}
