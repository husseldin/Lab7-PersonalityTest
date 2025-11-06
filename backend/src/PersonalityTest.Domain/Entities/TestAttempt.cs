using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class TestAttempt : BaseEntity
{
    public required Guid UserId { get; set; }
    public required Guid QuestionVersionId { get; set; }
    public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;
    public required DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ResultType { get; set; }

    // Raw scores for each dimension
    public int ScoreE { get; set; }
    public int ScoreI { get; set; }
    public int ScoreS { get; set; }
    public int ScoreN { get; set; }
    public int ScoreT { get; set; }
    public int ScoreF { get; set; }
    public int ScoreJ { get; set; }
    public int ScoreP { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public QuestionVersion? QuestionVersion { get; set; }
    public ICollection<TestAnswer> TestAnswers { get; set; } = new List<TestAnswer>();
    public Share? Share { get; set; }
    public Entitlement? Entitlement { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
