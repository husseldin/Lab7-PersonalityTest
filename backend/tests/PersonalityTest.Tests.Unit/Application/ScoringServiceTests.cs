using Moq;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Application.Services;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.Enums;
using Xunit;
using FluentAssertions;

namespace PersonalityTest.Tests.Unit.Application;

public class ScoringServiceTests
{
    private readonly Mock<ITestRepository> _mockTestRepository;
    private readonly ScoringService _scoringService;

    public ScoringServiceTests()
    {
        _mockTestRepository = new Mock<ITestRepository>();
        _scoringService = new ScoringService(_mockTestRepository.Object);
    }

    [Fact]
    public async Task CalculateScoresAsync_ValidAttempt_ReturnsCorrectScores()
    {
        // Arrange
        var attemptId = Guid.NewGuid();
        var versionId = Guid.NewGuid();

        var attempt = new TestAttempt
        {
            Id = attemptId,
            UserId = Guid.NewGuid(),
            QuestionVersionId = versionId,
            StartedAt = DateTime.UtcNow,
            Status = AttemptStatus.InProgress
        };

        var questions = new List<Question>
        {
            new() { Id = Guid.NewGuid(), VersionId = versionId, OrderIndex = 1, Text = "Q1",
                   Dimension = Dimension.EI, Direction = Direction.Positive, Weight = 1.0m },
            new() { Id = Guid.NewGuid(), VersionId = versionId, OrderIndex = 2, Text = "Q2",
                   Dimension = Dimension.EI, Direction = Direction.Negative, Weight = 1.0m }
        };

        var answers = new List<TestAnswer>
        {
            new() { AttemptId = attemptId, QuestionId = questions[0].Id, Answer = 5 }, // Strongly Agree (E+2)
            new() { AttemptId = attemptId, QuestionId = questions[1].Id, Answer = 2 }  // Disagree (I+1)
        };

        _mockTestRepository.Setup(r => r.GetAttemptByIdAsync(attemptId))
            .ReturnsAsync(attempt);
        _mockTestRepository.Setup(r => r.GetQuestionsByVersionAsync(versionId))
            .ReturnsAsync(questions);
        _mockTestRepository.Setup(r => r.GetAttemptAnswersAsync(attemptId))
            .ReturnsAsync(answers);

        // Act
        var result = await _scoringService.CalculateScoresAsync(attemptId);

        // Assert
        result.ScoreE.Should().Be(2); // 5-3 = +2
        result.ScoreI.Should().Be(1); // 3-2 = -1, abs = 1
    }

    [Fact]
    public async Task CalculateScoresAsync_NonexistentAttempt_ThrowsArgumentException()
    {
        // Arrange
        var attemptId = Guid.NewGuid();
        _mockTestRepository.Setup(r => r.GetAttemptByIdAsync(attemptId))
            .ReturnsAsync((TestAttempt?)null);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _scoringService.CalculateScoresAsync(attemptId));
    }
}
