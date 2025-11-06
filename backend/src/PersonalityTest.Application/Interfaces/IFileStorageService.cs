namespace PersonalityTest.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<string> GetPresignedUrlAsync(string storageKey, int expiryMinutes = 15);
    Task DeleteFileAsync(string storageKey);
}
