using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class TestAnswerConfiguration : IEntityTypeConfiguration<TestAnswer>
{
    public void Configure(EntityTypeBuilder<TestAnswer> builder)
    {
        builder.HasKey(ta => ta.Id);

        builder.HasIndex(ta => new { ta.AttemptId, ta.QuestionId })
            .IsUnique();

        builder.HasOne(ta => ta.Attempt)
            .WithMany(t => t.TestAnswers)
            .HasForeignKey(ta => ta.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ta => ta.Question)
            .WithMany(q => q.TestAnswers)
            .HasForeignKey(ta => ta.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
