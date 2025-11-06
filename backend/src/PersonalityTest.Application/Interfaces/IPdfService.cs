namespace PersonalityTest.Application.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateReportPdfAsync(Guid attemptId, bool isComplete);
}
