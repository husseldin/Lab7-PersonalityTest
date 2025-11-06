using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Bio)
            .HasMaxLength(500);

        builder.HasIndex(u => u.EmailVerificationToken);
        builder.HasIndex(u => u.PasswordResetToken);

        builder.HasQueryFilter(u => !u.IsDeleted);

        builder.HasOne(u => u.ProfilePicture)
            .WithMany()
            .HasForeignKey(u => u.ProfilePictureFileId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
