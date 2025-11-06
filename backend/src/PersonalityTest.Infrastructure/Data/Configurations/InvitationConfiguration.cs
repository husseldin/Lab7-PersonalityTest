using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
{
    public void Configure(EntityTypeBuilder<Invitation> builder)
    {
        builder.HasKey(i => i.Id);

        builder.HasIndex(i => i.InviteCode)
            .IsUnique();

        builder.HasIndex(i => i.InviterId);
        builder.HasIndex(i => i.InviteeEmail);

        builder.Property(i => i.InviteCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.InviteeEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasOne(i => i.Inviter)
            .WithMany(u => u.SentInvitations)
            .HasForeignKey(i => i.InviterId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.InviteeUser)
            .WithMany(u => u.ReceivedInvitations)
            .HasForeignKey(i => i.InviteeUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
