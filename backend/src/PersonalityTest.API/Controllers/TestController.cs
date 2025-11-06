using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalityTest.Application.DTOs.Test;
using PersonalityTest.Application.Interfaces;
using PersonalityTest.Domain.Entities;
using PersonalityTest.Domain.Enums;
using PersonalityTest.Domain.ValueObjects;
using System.Security.Claims;

namespace PersonalityTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestController : ControllerBase
{
    private readonly ITestRepository _testRepository;
    private readonly IScoringService _scoringService;

    public TestController(ITestRepository testRepository, IScoringService scoringService)
    {
        _testRepository = testRepository;
        _scoringService = scoringService;
    }

    [HttpGet("questions")]
    public async Task<ActionResult<StartTestResponse>> GetQuestions([FromQuery] string version = "latest")
    {
        var questionVersion = version == "latest"
            ? await _testRepository.GetActiveVersionAsync()
            : await _testRepository.GetVersionByNameAsync(version);

        if (questionVersion == null)
        {
            return NotFound(new { message = "Question version not found" });
        }

        var questions = await _testRepository.GetQuestionsByVersionAsync(questionVersion.Id);

        return Ok(new StartTestResponse
        {
            AttemptId = Guid.Empty, // Will be created when test starts
            Version = questionVersion.VersionName,
            Questions = questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                OrderIndex = q.OrderIndex,
                Text = q.Text
            }).ToList()
        });
    }

    [HttpPost("start")]
    public async Task<ActionResult<StartTestResponse>> StartTest()
    {
        var userId = GetCurrentUserId();
        var questionVersion = await _testRepository.GetActiveVersionAsync();

        if (questionVersion == null)
        {
            return BadRequest(new { message = "No active question version available" });
        }

        var attempt = new TestAttempt
        {
            UserId = userId,
            QuestionVersionId = questionVersion.Id,
            StartedAt = DateTime.UtcNow,
            Status = AttemptStatus.InProgress
        };

        await _testRepository.CreateAttemptAsync(attempt);

        var questions = await _testRepository.GetQuestionsByVersionAsync(questionVersion.Id);

        return Ok(new StartTestResponse
        {
            AttemptId = attempt.Id,
            Version = questionVersion.VersionName,
            Questions = questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                OrderIndex = q.OrderIndex,
                Text = q.Text
            }).ToList()
        });
    }

    [HttpPatch("attempts/{attemptId}/answers")]
    public async Task<IActionResult> SaveAnswers(Guid attemptId, [FromBody] SaveAnswersRequest request)
    {
        var userId = GetCurrentUserId();
        var attempt = await _testRepository.GetAttemptByIdAsync(attemptId);

        if (attempt == null || attempt.UserId != userId)
        {
            return NotFound(new { message = "Attempt not found" });
        }

        if (attempt.Status == AttemptStatus.Completed)
        {
            return BadRequest(new { message = "Cannot modify completed attempt" });
        }

        foreach (var answer in request.Answers)
        {
            await _testRepository.SaveAnswerAsync(new TestAnswer
            {
                AttemptId = attemptId,
                QuestionId = answer.QuestionId,
                Answer = answer.Answer
            });
        }

        return Ok(new { message = "Answers saved successfully" });
    }

    [HttpPost("attempts/{attemptId}/submit")]
    public async Task<ActionResult<TestResultDto>> SubmitTest(Guid attemptId)
    {
        var userId = GetCurrentUserId();
        var attempt = await _testRepository.GetAttemptByIdAsync(attemptId);

        if (attempt == null || attempt.UserId != userId)
        {
            return NotFound(new { message = "Attempt not found" });
        }

        if (attempt.Status == AttemptStatus.Completed)
        {
            return BadRequest(new { message = "Attempt already completed" });
        }

        // Calculate scores
        var (resultType, scoreE, scoreI, scoreS, scoreN, scoreT, scoreF, scoreJ, scoreP) =
            await _scoringService.CalculateScoresAsync(attemptId);

        // Update attempt
        attempt.Status = AttemptStatus.Completed;
        attempt.CompletedAt = DateTime.UtcNow;
        attempt.ResultType = resultType;
        attempt.ScoreE = scoreE;
        attempt.ScoreI = scoreI;
        attempt.ScoreS = scoreS;
        attempt.ScoreN = scoreN;
        attempt.ScoreT = scoreT;
        attempt.ScoreF = scoreF;
        attempt.ScoreJ = scoreJ;
        attempt.ScoreP = scoreP;

        await _testRepository.UpdateAttemptAsync(attempt);

        var personalityType = PersonalityType.FromCode(resultType);

        return Ok(new TestResultDto
        {
            AttemptId = attempt.Id,
            PersonalityType = resultType,
            TypeName = personalityType.GetName(),
            TypeDescription = personalityType.GetDescription(),
            CompletedAt = attempt.CompletedAt!.Value,
            Scores = new ScoreBreakdownDto
            {
                ScoreE = scoreE,
                ScoreI = scoreI,
                ScoreS = scoreS,
                ScoreN = scoreN,
                ScoreT = scoreT,
                ScoreF = scoreF,
                ScoreJ = scoreJ,
                ScoreP = scoreP
            },
            HasCompleteReport = attempt.Entitlement != null
        });
    }

    [HttpGet("attempts/{attemptId}/result")]
    public async Task<ActionResult<TestResultDto>> GetResult(Guid attemptId)
    {
        var userId = GetCurrentUserId();
        var attempt = await _testRepository.GetAttemptByIdAsync(attemptId);

        if (attempt == null || attempt.UserId != userId)
        {
            return NotFound(new { message = "Attempt not found" });
        }

        if (attempt.Status != AttemptStatus.Completed)
        {
            return BadRequest(new { message = "Attempt not completed yet" });
        }

        var personalityType = PersonalityType.FromCode(attempt.ResultType!);

        return Ok(new TestResultDto
        {
            AttemptId = attempt.Id,
            PersonalityType = attempt.ResultType!,
            TypeName = personalityType.GetName(),
            TypeDescription = personalityType.GetDescription(),
            CompletedAt = attempt.CompletedAt!.Value,
            Scores = new ScoreBreakdownDto
            {
                ScoreE = attempt.ScoreE,
                ScoreI = attempt.ScoreI,
                ScoreS = attempt.ScoreS,
                ScoreN = attempt.ScoreN,
                ScoreT = attempt.ScoreT,
                ScoreF = attempt.ScoreF,
                ScoreJ = attempt.ScoreJ,
                ScoreP = attempt.ScoreP
            },
            HasCompleteReport = attempt.Entitlement != null
        });
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<AttemptHistoryDto>>> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var skip = (page - 1) * pageSize;

        var attempts = await _testRepository.GetUserAttemptsAsync(userId, skip, pageSize);

        var history = attempts
            .Where(a => a.Status == AttemptStatus.Completed)
            .Select(a => new AttemptHistoryDto
            {
                Id = a.Id,
                CompletedAt = a.CompletedAt!.Value,
                PersonalityType = a.ResultType!,
                TypeName = PersonalityType.FromCode(a.ResultType!).GetName(),
                HasCompleteReport = a.Entitlement != null,
                ShareCode = a.Share?.ShareCode
            })
            .ToList();

        return Ok(history);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}
