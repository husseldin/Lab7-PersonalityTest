namespace PersonalityTest.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailVerificationAsync(string toEmail, string userName, string verificationToken);
    Task SendPasswordResetAsync(string toEmail, string userName, string resetToken);
    Task SendInvitationAsync(string toEmail, string inviterName, string inviteCode);
    Task SendPaymentReceiptAsync(string toEmail, string userName, decimal amount, string attemptId);
}
