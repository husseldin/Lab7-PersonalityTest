namespace PersonalityTest.Domain.Entities;

public class FriendLink : BaseEntity
{
    public required Guid UserId { get; set; }
    public required Guid FriendUserId { get; set; }
    public bool ConsentGiven { get; set; }

    // Note: Navigation properties intentionally omitted to avoid circular references
    // Can be loaded explicitly via EF Core when needed
}
