using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class QuestionVersionConfiguration : IEntityTypeConfiguration<QuestionVersion>
{
    public void Configure(EntityTypeBuilder<QuestionVersion> builder)
    {
        builder.HasKey(qv => qv.Id);

        builder.HasIndex(qv => qv.VersionName)
            .IsUnique();

        builder.Property(qv => qv.VersionName)
            .IsRequired()
            .HasMaxLength(50);
    }
}
