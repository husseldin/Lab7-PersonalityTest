using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class EntitlementConfiguration : IEntityTypeConfiguration<Entitlement>
{
    public void Configure(EntityTypeBuilder<Entitlement> builder)
    {
        builder.HasKey(e => e.Id);

        builder.HasIndex(e => e.AttemptId)
            .IsUnique();

        builder.HasIndex(e => e.UserId);

        builder.HasOne(e => e.User)
            .WithMany(u => u.Entitlements)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Attempt)
            .WithOne(a => a.Entitlement)
            .HasForeignKey<Entitlement>(e => e.AttemptId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Payment)
            .WithMany(p => p.Entitlements)
            .HasForeignKey(e => e.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
