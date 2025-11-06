namespace PersonalityTest.Domain.Entities;

public class QuestionVersion : BaseEntity
{
    public required string VersionName { get; set; }
    public bool IsActive { get; set; }

    // Navigation properties
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<TestAttempt> TestAttempts { get; set; } = new List<TestAttempt>();
}
