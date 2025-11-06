namespace PersonalityTest.Application.DTOs.Share;

public class ShareDto
{
    public required string ShareCode { get; set; }
    public required string ShareUrl { get; set; }
    public required string Privacy { get; set; }
    public required int ViewCount { get; set; }
}
