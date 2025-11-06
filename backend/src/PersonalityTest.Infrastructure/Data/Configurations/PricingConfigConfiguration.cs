using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class PricingConfigConfiguration : IEntityTypeConfiguration<PricingConfig>
{
    public void Configure(EntityTypeBuilder<PricingConfig> builder)
    {
        builder.HasKey(pc => pc.Id);

        builder.Property(pc => pc.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(pc => pc.StripePriceId)
            .HasMaxLength(255);
    }
}
