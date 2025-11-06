using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data.Configurations;

public class FriendLinkConfiguration : IEntityTypeConfiguration<FriendLink>
{
    public void Configure(EntityTypeBuilder<FriendLink> builder)
    {
        builder.HasKey(f => f.Id);

        builder.HasIndex(f => new { f.UserId, f.FriendUserId })
            .IsUnique();

        builder.HasIndex(f => f.UserId);
        builder.HasIndex(f => f.FriendUserId);
    }
}
