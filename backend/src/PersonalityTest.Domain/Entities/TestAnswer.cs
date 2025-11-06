namespace PersonalityTest.Domain.Entities;

public class TestAnswer : BaseEntity
{
    public required Guid AttemptId { get; set; }
    public required Guid QuestionId { get; set; }
    public required int Answer { get; set; } // 1-5 Likert scale

    // Navigation properties
    public TestAttempt? Attempt { get; set; }
    public Question? Question { get; set; }
}
