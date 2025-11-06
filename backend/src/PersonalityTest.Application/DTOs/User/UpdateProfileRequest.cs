namespace PersonalityTest.Application.DTOs.User;

public class UpdateProfileRequest
{
    public required string FullName { get; set; }
    public string? Bio { get; set; }
}
