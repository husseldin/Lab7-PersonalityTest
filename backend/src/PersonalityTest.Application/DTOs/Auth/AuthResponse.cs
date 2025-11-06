namespace PersonalityTest.Application.DTOs.Auth;

public class AuthResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required UserDto User { get; set; }
}

public class UserDto
{
    public required Guid Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public required bool EmailVerified { get; set; }
    public required string Role { get; set; }
}
