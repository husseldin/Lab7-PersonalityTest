using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class ShareConfiguration : IEntityTypeConfiguration<Share>
{
    public void Configure(EntityTypeBuilder<Share> builder)
    {
        builder.HasKey(s => s.Id);

        builder.HasIndex(s => s.ShareCode)
            .IsUnique();

        builder.HasIndex(s => s.AttemptId)
            .IsUnique();

        builder.Property(s => s.ShareCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasOne(s => s.User)
            .WithMany(u => u.Shares)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Attempt)
            .WithOne(a => a.Share)
            .HasForeignKey<Share>(s => s.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
