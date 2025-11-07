using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.ValueObjects;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PersonalityTest.Infrastructure.Services;

public class PdfService : IPdfService
{
    private readonly ITestRepository _testRepository;

    static PdfService()
    {
        // Set license type for QuestPDF (Community license is free for open source)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public PdfService(ITestRepository testRepository)
    {
        _testRepository = testRepository;
    }

    public async Task<byte[]> GenerateReportPdfAsync(Guid attemptId, bool isComplete)
    {
        var attempt = await _testRepository.GetAttemptByIdAsync(attemptId)
            ?? throw new ArgumentException("Test attempt not found");

        if (attempt.ResultType == null)
            throw new InvalidOperationException("Test results not yet calculated");

        var personalityType = PersonalityType.FromCode(attempt.ResultType);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Segoe UI"));

                page.Header().Element(c => ComposeHeader(c, personalityType, attempt, isComplete));
                page.Content().Element(c => ComposeContent(c, attempt, personalityType, isComplete));
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, PersonalityType personalityType, TestAttempt attempt, bool isComplete)
    {
        container.Column(column =>
        {
            column.Item().BorderBottom(3).BorderColor("#4CAF50").PaddingBottom(15).Column(header =>
            {
                header.Item().AlignCenter().Text("Personality Assessment Report")
                    .FontSize(28).FontColor("#4CAF50").Bold();

                header.Item().AlignCenter().PaddingTop(5).Text(text =>
                {
                    text.Span("Test completed on ");
                    text.Span(attempt.CompletedAt?.ToString("MMMM dd, yyyy") ?? "N/A").SemiBold();
                });

                header.Item().AlignCenter().PaddingTop(3).Text(isComplete ? "Premium Report" : "Basic Report")
                    .FontSize(10).FontColor(Colors.Grey.Darken2);
            });

            // Result Box
            column.Item().PaddingTop(20).Background("#667eea").Padding(25).Column(resultBox =>
            {
                resultBox.Item().AlignCenter().Text(personalityType.Code)
                    .FontSize(48).FontColor(Colors.White).Bold();

                resultBox.Item().AlignCenter().PaddingTop(8).Text(personalityType.GetName())
                    .FontSize(24).FontColor(Colors.White);

                resultBox.Item().AlignCenter().PaddingTop(8).Text(personalityType.GetDescription())
                    .FontSize(14).FontColor(Colors.White);
            });
        });
    }

    private void ComposeContent(IContainer container, TestAttempt attempt, PersonalityType personalityType, bool isComplete)
    {
        container.PaddingVertical(20).Column(column =>
        {
            // Personality Dimensions Section
            column.Item().PaddingBottom(20).Column(section =>
            {
                section.Item().Text("Personality Dimensions")
                    .FontSize(18).FontColor("#4CAF50").Bold();

                section.Item().PaddingTop(15).Column(dimensions =>
                {
                    ComposeScoreBar(dimensions, "Extraversion (E) vs Introversion (I)",
                        attempt.ScoreE, attempt.ScoreI, "E", "I");
                    ComposeScoreBar(dimensions, "Sensing (S) vs Intuition (N)",
                        attempt.ScoreS, attempt.ScoreN, "S", "N");
                    ComposeScoreBar(dimensions, "Thinking (T) vs Feeling (F)",
                        attempt.ScoreT, attempt.ScoreF, "T", "F");
                    ComposeScoreBar(dimensions, "Judging (J) vs Perceiving (P)",
                        attempt.ScoreJ, attempt.ScoreP, "J", "P");
                });
            });

            if (isComplete)
            {
                // Career Recommendations
                column.Item().PaddingBottom(15).Column(section =>
                {
                    section.Item().Text("Career Recommendations")
                        .FontSize(18).FontColor("#4CAF50").Bold();

                    section.Item().PaddingTop(10).Text($"Based on your {personalityType.Code} personality type, you may thrive in careers that leverage your natural strengths:")
                        .LineHeight(1.5f);

                    section.Item().PaddingTop(8).PaddingLeft(15).Column(list =>
                    {
                        list.Item().Text("• Strategic planning and analysis roles").LineHeight(1.5f);
                        list.Item().Text("• Leadership and management positions").LineHeight(1.5f);
                        list.Item().Text("• Innovation and problem-solving opportunities").LineHeight(1.5f);
                        list.Item().Text("• Independent work with creative freedom").LineHeight(1.5f);
                    });
                });

                // Growth Recommendations
                column.Item().PaddingBottom(15).Column(section =>
                {
                    section.Item().Text("Growth Recommendations")
                        .FontSize(18).FontColor("#4CAF50").Bold();

                    section.Item().PaddingTop(10).PaddingLeft(15).Column(list =>
                    {
                        list.Item().Text("• Continue developing your natural strengths").LineHeight(1.5f);
                        list.Item().Text("• Practice balancing different personality aspects").LineHeight(1.5f);
                        list.Item().Text("• Seek opportunities for personal growth").LineHeight(1.5f);
                        list.Item().Text("• Build relationships with diverse personality types").LineHeight(1.5f);
                    });
                });

                // Relationship Insights
                column.Item().Column(section =>
                {
                    section.Item().Text("Relationship Insights")
                        .FontSize(18).FontColor("#4CAF50").Bold();

                    section.Item().PaddingTop(10).Text(
                        $"Understanding your personality type can help improve your relationships both personally and professionally. " +
                        $"Your {personalityType.Code} type brings unique strengths to relationships and team dynamics.")
                        .LineHeight(1.5f);
                });
            }
            else
            {
                // Premium Upgrade Notice
                column.Item().Background("#fff3cd").Border(2).BorderColor("#ffc107")
                    .Padding(20).AlignCenter().Text(
                        "Unlock complete career insights, growth recommendations, and relationship guidance with the premium report.")
                    .FontSize(12).FontColor("#856404").Bold();
            }
        });
    }

    private void ComposeScoreBar(ColumnDescriptor column, string label, int scoreA, int scoreB, string labelA, string labelB)
    {
        column.Item().PaddingBottom(15).Column(dimension =>
        {
            dimension.Item().Text(label).FontSize(11).SemiBold();

            // Score bar
            dimension.Item().PaddingTop(5).Height(25).Background(Colors.Grey.Lighten3).Row(row =>
            {
                var total = scoreA + scoreB;
                var percentage = total == 0 ? 50 : (scoreA * 100.0 / total);

                row.RelativeItem((float)percentage).Background("#4CAF50");
                row.RelativeItem((float)(100 - percentage));
            });

            dimension.Item().PaddingTop(5).Text($"{labelA}: {scoreA}  |  {labelB}: {scoreB}")
                .FontSize(10).FontColor(Colors.Grey.Darken1);
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(15).Column(footer =>
        {
            footer.Item().AlignCenter().Text(text =>
            {
                text.Span("Disclaimer: ").Bold();
                text.Span("This assessment is inspired by personality type theory but is not affiliated with " +
                         "the Myers-Briggs Type Indicator® or The Myers & Briggs Foundation. Results should be used for personal growth " +
                         "and self-reflection, not as definitive psychological evaluations.");
            }).FontSize(9).FontColor(Colors.Grey.Darken1).LineHeight(1.3f);

            footer.Item().AlignCenter().PaddingTop(8).Text($"© {DateTime.UtcNow.Year} Personality Test Platform. All rights reserved.")
                .FontSize(9).FontColor(Colors.Grey.Darken1);
        });
    }
}
