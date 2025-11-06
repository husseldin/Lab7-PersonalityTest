using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class FileConfiguration : IEntityTypeConfiguration<Domain.Entities.File>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.File> builder)
    {
        builder.HasKey(f => f.Id);

        builder.HasIndex(f => f.StorageKey)
            .IsUnique();

        builder.HasIndex(f => f.UserId);

        builder.Property(f => f.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(f => f.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.StorageKey)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(f => f.User)
            .WithMany(u => u.Files)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
