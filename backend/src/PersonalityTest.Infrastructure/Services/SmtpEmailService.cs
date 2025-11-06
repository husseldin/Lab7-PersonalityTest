using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using PersonalityTest.Application.Interfaces;

namespace PersonalityTest.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPassword;
    private readonly string _baseUrl;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
        _fromEmail = configuration["Email:FromEmail"] ?? "noreply@personalitytest.com";
        _fromName = configuration["Email:FromName"] ?? "Personality Test";
        _smtpHost = configuration["Email:SmtpHost"] ?? "localhost";
        _smtpPort = int.Parse(configuration["Email:SmtpPort"] ?? "587");
        _smtpUser = configuration["Email:SmtpUser"] ?? "";
        _smtpPassword = configuration["Email:SmtpPassword"] ?? "";
        _baseUrl = configuration["App:BaseUrl"] ?? "http://localhost:4200";
    }

    public async Task SendEmailVerificationAsync(string toEmail, string userName, string verificationToken)
    {
        var verifyUrl = $"{_baseUrl}/auth/verify?token={verificationToken}";
        var subject = "Verify Your Email Address";
        var body = $@"
<html>
<body>
    <h2>Welcome to Personality Test, {userName}!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href=""{verifyUrl}"">Verify Email</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, please ignore this email.</p>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendPasswordResetAsync(string toEmail, string userName, string resetToken)
    {
        var resetUrl = $"{_baseUrl}/auth/reset-password?token={resetToken}";
        var subject = "Reset Your Password";
        var body = $@"
<html>
<body>
    <h2>Password Reset Request</h2>
    <p>Hi {userName},</p>
    <p>Click the link below to reset your password:</p>
    <p><a href=""{resetUrl}"">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendInvitationAsync(string toEmail, string inviterName, string inviteCode)
    {
        var inviteUrl = $"{_baseUrl}/invite/{inviteCode}";
        var subject = $"{inviterName} invited you to Personality Test";
        var body = $@"
<html>
<body>
    <h2>You've been invited!</h2>
    <p>{inviterName} has invited you to take the Personality Test and compare results.</p>
    <p><a href=""{inviteUrl}"">Accept Invitation</a></p>
    <p>This invitation will expire in 7 days.</p>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendPaymentReceiptAsync(string toEmail, string userName, decimal amount, string attemptId)
    {
        var subject = "Payment Receipt - Complete Report";
        var body = $@"
<html>
<body>
    <h2>Payment Received</h2>
    <p>Thank you, {userName}!</p>
    <p>We've received your payment of ${amount:F2} for the Complete Personality Report.</p>
    <p>Your report is now available in your <a href=""{_baseUrl}/history"">test history</a>.</p>
    <p>Receipt ID: {attemptId}</p>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = htmlBody };
        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_smtpHost, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            if (!string.IsNullOrEmpty(_smtpUser))
            {
                await client.AuthenticateAsync(_smtpUser, _smtpPassword);
            }
            await client.SendAsync(message);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}
