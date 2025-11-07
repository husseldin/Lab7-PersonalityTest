using Microsoft.Playwright;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.ValueObjects;

namespace PersonalityTest.Infrastructure.Services;

public class PdfService : IPdfService
{
    private readonly ITestRepository _testRepository;
    private static IPlaywright? _playwright;
    private static IBrowser? _browser;
    private static readonly SemaphoreSlim _initLock = new(1, 1);

    public PdfService(ITestRepository testRepository)
    {
        _testRepository = testRepository;
    }

    private async Task EnsureBrowserInitializedAsync()
    {
        if (_browser != null) return;

        await _initLock.WaitAsync();
        try
        {
            if (_browser != null) return;

            _playwright = await Playwright.CreateAsync();
            _browser = await _playwright.Chromium.LaunchAsync(new()
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" }
            });
        }
        finally
        {
            _initLock.Release();
        }
    }

    public async Task<byte[]> GenerateReportPdfAsync(Guid attemptId, bool isComplete)
    {
        await EnsureBrowserInitializedAsync();

        var attempt = await _testRepository.GetAttemptByIdAsync(attemptId)
            ?? throw new ArgumentException("Test attempt not found");

        if (attempt.ResultType == null)
            throw new InvalidOperationException("Test results not yet calculated");

        var personalityType = PersonalityType.FromCode(attempt.ResultType);

        // Generate HTML content for the report
        var html = GenerateReportHtml(attempt, personalityType, isComplete);

        // Create a new page and generate PDF
        var page = await _browser!.NewPageAsync();
        try
        {
            await page.SetContentAsync(html);
            var pdfBytes = await page.PdfAsync(new()
            {
                Format = "A4",
                PrintBackground = true,
                Margin = new()
                {
                    Top = "20mm",
                    Bottom = "20mm",
                    Left = "20mm",
                    Right = "20mm"
                }
            });

            return pdfBytes;
        }
        finally
        {
            await page.CloseAsync();
        }
    }

    private string GenerateReportHtml(TestAttempt attempt, PersonalityType personalityType, bool isComplete)
    {
        var completedDate = attempt.CompletedAt?.ToString("MMMM dd, yyyy") ?? "N/A";

        var basicContent = $@"
            <div class='section'>
                <h2>Personality Dimensions</h2>
                <div class='dimension'>
                    <div class='dimension-label'>Extraversion (E) vs Introversion (I)</div>
                    <div class='score-bar'>
                        <div class='score-fill' style='width: {GetPercentage(attempt.ScoreE, attempt.ScoreI)}%'></div>
                    </div>
                    <div class='dimension-score'>E: {attempt.ScoreE} | I: {attempt.ScoreI}</div>
                </div>
                <div class='dimension'>
                    <div class='dimension-label'>Sensing (S) vs Intuition (N)</div>
                    <div class='score-bar'>
                        <div class='score-fill' style='width: {GetPercentage(attempt.ScoreS, attempt.ScoreN)}%'></div>
                    </div>
                    <div class='dimension-score'>S: {attempt.ScoreS} | N: {attempt.ScoreN}</div>
                </div>
                <div class='dimension'>
                    <div class='dimension-label'>Thinking (T) vs Feeling (F)</div>
                    <div class='score-bar'>
                        <div class='score-fill' style='width: {GetPercentage(attempt.ScoreT, attempt.ScoreF)}%'></div>
                    </div>
                    <div class='dimension-score'>T: {attempt.ScoreT} | F: {attempt.ScoreF}</div>
                </div>
                <div class='dimension'>
                    <div class='dimension-label'>Judging (J) vs Perceiving (P)</div>
                    <div class='score-bar'>
                        <div class='score-fill' style='width: {GetPercentage(attempt.ScoreJ, attempt.ScoreP)}%'></div>
                    </div>
                    <div class='dimension-score'>J: {attempt.ScoreJ} | P: {attempt.ScoreP}</div>
                </div>
            </div>";

        var completeContent = isComplete ? $@"
            <div class='section'>
                <h2>Career Recommendations</h2>
                <p>Based on your {personalityType.Code} personality type, you may thrive in careers that leverage your natural strengths:</p>
                <ul>
                    <li>Strategic planning and analysis roles</li>
                    <li>Leadership and management positions</li>
                    <li>Innovation and problem-solving opportunities</li>
                    <li>Independent work with creative freedom</li>
                </ul>
            </div>
            <div class='section'>
                <h2>Growth Recommendations</h2>
                <ul>
                    <li>Continue developing your natural strengths</li>
                    <li>Practice balancing different personality aspects</li>
                    <li>Seek opportunities for personal growth</li>
                    <li>Build relationships with diverse personality types</li>
                </ul>
            </div>
            <div class='section'>
                <h2>Relationship Insights</h2>
                <p>Understanding your personality type can help improve your relationships both personally and professionally.
                Your {personalityType.Code} type brings unique strengths to relationships and team dynamics.</p>
            </div>" :
            "<div class='premium-notice'>Unlock complete career insights, growth recommendations, and relationship guidance with the premium report.</div>";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Personality Test Report - {personalityType.Code}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }}
        .header {{ text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4CAF50; padding-bottom: 20px; }}
        .header h1 {{ color: #4CAF50; margin: 10px 0; font-size: 32px; }}
        .header .subtitle {{ color: #666; font-size: 16px; }}
        .result-box {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }}
        .result-box h2 {{ margin: 0 0 10px 0; font-size: 48px; }}
        .result-box .type-name {{ font-size: 24px; margin-bottom: 10px; }}
        .result-box .description {{ font-size: 16px; opacity: 0.9; }}
        .section {{ margin: 30px 0; page-break-inside: avoid; }}
        .section h2 {{ color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }}
        .dimension {{ margin: 20px 0; }}
        .dimension-label {{ font-weight: bold; margin-bottom: 5px; }}
        .score-bar {{ height: 30px; background: #e0e0e0; border-radius: 15px; overflow: hidden; position: relative; }}
        .score-fill {{ height: 100%; background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%); transition: width 0.3s; }}
        .dimension-score {{ margin-top: 5px; color: #666; font-size: 14px; }}
        .premium-notice {{ background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; text-align: center; color: #856404; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }}
        ul {{ padding-left: 20px; }}
        li {{ margin: 10px 0; line-height: 1.6; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>Personality Assessment Report</h1>
        <div class='subtitle'>Test completed on {completedDate}</div>
        <div class='subtitle'>{(isComplete ? "Premium Report" : "Basic Report")}</div>
    </div>

    <div class='result-box'>
        <h2>{personalityType.Code}</h2>
        <div class='type-name'>{personalityType.GetName()}</div>
        <div class='description'>{personalityType.GetDescription()}</div>
    </div>

    {basicContent}

    {completeContent}

    <div class='footer'>
        <p><strong>Disclaimer:</strong> This assessment is inspired by personality type theory but is not affiliated with
        the Myers-Briggs Type Indicator® or The Myers & Briggs Foundation. Results should be used for personal growth
        and self-reflection, not as definitive psychological evaluations.</p>
        <p>© {DateTime.UtcNow.Year} Personality Test Platform. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private double GetPercentage(int scoreA, int scoreB)
    {
        var total = scoreA + scoreB;
        return total == 0 ? 50 : (scoreA * 100.0 / total);
    }
}
