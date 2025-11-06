namespace PersonalityTest.Application.Interfaces;

public interface IPaymentService
{
    Task<string> CreateCheckoutSessionAsync(Guid userId, Guid attemptId, int priceInCents, string currency);
    Task<bool> VerifyWebhookSignatureAsync(string payload, string signature);
    Task<(string PaymentIntentId, string Status)> ProcessWebhookEventAsync(string eventJson);
}
