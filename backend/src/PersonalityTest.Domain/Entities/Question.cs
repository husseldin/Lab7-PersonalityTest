using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class Question : BaseEntity
{
    public required Guid VersionId { get; set; }
    public required int OrderIndex { get; set; }
    public required string Text { get; set; }
    public required Dimension Dimension { get; set; }
    public required Direction Direction { get; set; }
    public decimal Weight { get; set; } = 1.0m;

    // Navigation properties
    public QuestionVersion? Version { get; set; }
    public ICollection<TestAnswer> TestAnswers { get; set; } = new List<TestAnswer>();
}
