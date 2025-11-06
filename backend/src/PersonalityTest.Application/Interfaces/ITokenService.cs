using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string GenerateEmailVerificationToken();
    string GeneratePasswordResetToken();
    Guid? ValidateAccessToken(string token);
}
