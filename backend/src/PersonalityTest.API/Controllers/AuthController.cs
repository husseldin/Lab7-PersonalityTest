using Microsoft.AspNetCore.Mvc;
using PersonalityTest.Application.DTOs.Auth;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public AuthController(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IEmailService emailService,
        IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailService = emailService;
        _refreshTokenRepository = refreshTokenRepository;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            return BadRequest(new { message = "Email already registered" });
        }

        // Create user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName,
            EmailVerified = false,
            EmailVerificationToken = _tokenService.GenerateEmailVerificationToken()
        };

        await _userRepository.CreateAsync(user);

        // Send verification email
        await _emailService.SendEmailVerificationAsync(user.Email, user.FullName, user.EmailVerificationToken!);

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Bio = user.Bio,
                ProfilePictureUrl = null,
                EmailVerified = user.EmailVerified,
                Role = user.Role.ToString()
            }
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Bio = user.Bio,
                ProfilePictureUrl = null,
                EmailVerified = user.EmailVerified,
                Role = user.Role.ToString()
            }
        });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        var user = await _userRepository.GetByEmailVerificationTokenAsync(token);
        if (user == null)
        {
            return BadRequest(new { message = "Invalid verification token" });
        }

        user.EmailVerified = true;
        user.EmailVerificationToken = null;
        await _userRepository.UpdateAsync(user);

        return Ok(new { message = "Email verified successfully" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // Don't reveal if email exists
            return Ok(new { message = "If the email exists, a reset link has been sent" });
        }

        user.PasswordResetToken = _tokenService.GeneratePasswordResetToken();
        user.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
        await _userRepository.UpdateAsync(user);

        await _emailService.SendPasswordResetAsync(user.Email, user.FullName, user.PasswordResetToken);

        return Ok(new { message = "If the email exists, a reset link has been sent" });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await _userRepository.GetByPasswordResetTokenAsync(request.Token);
        if (user == null)
        {
            return BadRequest(new { message = "Invalid or expired reset token" });
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiry = null;
        await _userRepository.UpdateAsync(user);

        return Ok(new { message = "Password reset successfully" });
    }
}
