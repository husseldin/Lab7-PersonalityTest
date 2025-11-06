using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.HasKey(q => q.Id);

        builder.HasIndex(q => new { q.VersionId, q.OrderIndex });

        builder.Property(q => q.Text)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(q => q.Weight)
            .HasPrecision(5, 2);

        builder.HasOne(q => q.Version)
            .WithMany(qv => qv.Questions)
            .HasForeignKey(q => q.VersionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
