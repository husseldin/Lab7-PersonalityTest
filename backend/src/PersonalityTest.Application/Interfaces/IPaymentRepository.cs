using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Application.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id);
    Task<Payment?> GetByStripePaymentIntentIdAsync(string stripePaymentIntentId);
    Task<Payment> CreateAsync(Payment payment);
    Task UpdateAsync(Payment payment);
    Task<IEnumerable<Payment>> GetUserPaymentsAsync(Guid userId, int skip, int take);
}
