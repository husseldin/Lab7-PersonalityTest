using FluentValidation;
using PersonalityTest.Application.DTOs.Test;

namespace PersonalityTest.Application.Validators;

public class SaveAnswersRequestValidator : AbstractValidator<SaveAnswersRequest>
{
    public SaveAnswersRequestValidator()
    {
        RuleFor(x => x.Answers)
            .NotEmpty().WithMessage("At least one answer is required");

        RuleForEach(x => x.Answers).ChildRules(answer =>
        {
            answer.RuleFor(a => a.QuestionId)
                .NotEmpty().WithMessage("Question ID is required");

            answer.RuleFor(a => a.Answer)
                .InclusiveBetween(1, 5).WithMessage("Answer must be between 1 and 5");
        });
    }
}
