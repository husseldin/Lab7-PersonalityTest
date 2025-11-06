namespace PersonalityTest.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public required Guid UserId { get; set; }
    public required string Token { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }

    // Navigation properties
    public User? User { get; set; }
}
