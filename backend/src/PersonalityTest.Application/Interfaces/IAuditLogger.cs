namespace PersonalityTest.Application.Interfaces;

public interface IAuditLogger
{
    Task LogAsync(Guid? userId, string action, string entityType, Guid? entityId,
                  string? ipAddress, string? userAgent, object? details);
}
