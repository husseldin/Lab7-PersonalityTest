using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class TestAttemptConfiguration : IEntityTypeConfiguration<TestAttempt>
{
    public void Configure(EntityTypeBuilder<TestAttempt> builder)
    {
        builder.HasKey(t => t.Id);

        builder.HasIndex(t => new { t.UserId, t.CompletedAt });

        builder.HasOne(t => t.User)
            .WithMany(u => u.TestAttempts)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.QuestionVersion)
            .WithMany(qv => qv.TestAttempts)
            .HasForeignKey(t => t.QuestionVersionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(t => t.ResultType)
            .HasMaxLength(4);
    }
}
