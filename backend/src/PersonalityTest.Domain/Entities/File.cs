using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class File : BaseEntity
{
    public required Guid UserId { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public required long SizeBytes { get; set; }
    public required string StorageKey { get; set; }
    public required FileType FileType { get; set; }

    // Navigation properties
    public User? User { get; set; }
}
