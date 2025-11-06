namespace PersonalityTest.Application.DTOs.Test;

public class SaveAnswersRequest
{
    public required List<AnswerDto> Answers { get; set; }
}

public class AnswerDto
{
    public required Guid QuestionId { get; set; }
    public required int Answer { get; set; } // 1-5
}
