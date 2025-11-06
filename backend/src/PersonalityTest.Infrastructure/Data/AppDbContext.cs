using Microsoft.EntityFrameworkCore;
using PersonalityTest.Domain.Entities;

namespace PersonalityTest.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Domain.Entities.File> Files => Set<Domain.Entities.File>();
    public DbSet<QuestionVersion> QuestionVersions => Set<QuestionVersion>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<TestAttempt> TestAttempts => Set<TestAttempt>();
    public DbSet<TestAnswer> TestAnswers => Set<TestAnswer>();
    public DbSet<Entitlement> Entitlements => Set<Entitlement>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Share> Shares => Set<Share>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<FriendLink> FriendLinks => Set<FriendLink>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<PricingConfig> PricingConfigs => Set<PricingConfig>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
