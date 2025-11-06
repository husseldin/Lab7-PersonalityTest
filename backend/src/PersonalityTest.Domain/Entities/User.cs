using PersonalityTest.Domain.Enums;

namespace PersonalityTest.Domain.Entities;

public class User : BaseEntity
{
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string FullName { get; set; }
    public string? Bio { get; set; }
    public Guid? ProfilePictureFileId { get; set; }
    public bool EmailVerified { get; set; }
    public string? EmailVerificationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiry { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsDeleted { get; set; }

    // Navigation properties
    public File? ProfilePicture { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<TestAttempt> TestAttempts { get; set; } = new List<TestAttempt>();
    public ICollection<File> Files { get; set; } = new List<File>();
    public ICollection<Invitation> SentInvitations { get; set; } = new List<Invitation>();
    public ICollection<Invitation> ReceivedInvitations { get; set; } = new List<Invitation>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Share> Shares { get; set; } = new List<Share>();
    public ICollection<Entitlement> Entitlements { get; set; } = new List<Entitlement>();
}
