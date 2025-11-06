using Microsoft.Extensions.Configuration;
using PersonalityTest.Application.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace PersonalityTest.Infrastructure.Services;

public class StripePaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly string _webhookSecret;
    private readonly string _baseUrl;

    public StripePaymentService(IConfiguration configuration)
    {
        _configuration = configuration;
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
        _webhookSecret = configuration["Stripe:WebhookSecret"] ?? "";
        _baseUrl = configuration["App:BaseUrl"] ?? "http://localhost:4200";
    }

    public async Task<string> CreateCheckoutSessionAsync(Guid userId, Guid attemptId,
                                                         int priceInCents, string currency)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = currency.ToLowerInvariant(),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "Complete Personality Report",
                            Description = "Unlock detailed insights, career advice, and growth recommendations"
                        },
                        UnitAmount = priceInCents
                    },
                    Quantity = 1
                }
            },
            Mode = "payment",
            SuccessUrl = $"{_baseUrl}/results/{attemptId}?payment=success",
            CancelUrl = $"{_baseUrl}/results/{attemptId}?payment=cancelled",
            ClientReferenceId = attemptId.ToString(),
            Metadata = new Dictionary<string, string>
            {
                ["UserId"] = userId.ToString(),
                ["AttemptId"] = attemptId.ToString()
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);
        return session.Url;
    }

    public Task<bool> VerifyWebhookSignatureAsync(string payload, string signature)
    {
        try
        {
            EventUtility.ConstructEvent(payload, signature, _webhookSecret);
            return Task.FromResult(true);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }

    public Task<(string PaymentIntentId, string Status)> ProcessWebhookEventAsync(string eventJson)
    {
        var stripeEvent = EventUtility.ParseEvent(eventJson);

        if (stripeEvent.Type == Events.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Session;
            return Task.FromResult((session!.PaymentIntentId, "succeeded"));
        }

        return Task.FromResult<(string, string)>((string.Empty, "unknown"));
    }
}
