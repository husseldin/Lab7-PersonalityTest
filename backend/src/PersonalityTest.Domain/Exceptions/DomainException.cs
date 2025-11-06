namespace PersonalityTest.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }

    public DomainException(string message, Exception innerException)
        : base(message, innerException) { }
}

public class EntityNotFoundException : DomainException
{
    public EntityNotFoundException(string entityName, Guid id)
        : base($"{entityName} with ID {id} was not found.") { }
}

public class InvalidOperationDomainException : DomainException
{
    public InvalidOperationDomainException(string message) : base(message) { }
}
