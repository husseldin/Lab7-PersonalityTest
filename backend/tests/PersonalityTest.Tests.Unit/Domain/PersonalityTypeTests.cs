using PersonalityTest.Domain.ValueObjects;
using Xunit;
using FluentAssertions;

namespace PersonalityTest.Tests.Unit.Domain;

public class PersonalityTypeTests
{
    [Theory]
    [InlineData("INTJ")]
    [InlineData("ENFP")]
    [InlineData("ISTP")]
    [InlineData("ESFJ")]
    public void FromCode_ValidCode_ReturnsPersonalityType(string code)
    {
        // Act
        var result = PersonalityType.FromCode(code);

        // Assert
        result.Should().NotBeNull();
        result.Code.Should().Be(code);
    }

    [Fact]
    public void FromCode_InvalidCode_ThrowsArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => PersonalityType.FromCode("XXXX"));
    }

    [Theory]
    [InlineData(10, 5, 8, 6, 9, 7, 11, 4, "ENTJ")] // E > I, N > S, T > F, J > P
    [InlineData(3, 12, 5, 10, 6, 9, 4, 11, "INFP")] // I > E, N > S, F > T, P > J
    [InlineData(7, 8, 10, 5, 8, 7, 6, 9, "ISTP")] // I >= E, S > N, T > F, P > J
    public void FromScores_CalculatesCorrectType(
        int scoreE, int scoreI, int scoreS, int scoreN,
        int scoreT, int scoreF, int scoreJ, int scoreP,
        string expectedType)
    {
        // Act
        var result = PersonalityType.FromScores(scoreE, scoreI, scoreS, scoreN, scoreT, scoreF, scoreJ, scoreP);

        // Assert
        result.Code.Should().Be(expectedType);
    }

    [Fact]
    public void GetName_ReturnsCorrectName()
    {
        // Arrange
        var type = PersonalityType.FromCode("INTJ");

        // Act
        var name = type.GetName();

        // Assert
        name.Should().Be("Architect");
    }

    [Fact]
    public void GetDescription_ReturnsCorrectDescription()
    {
        // Arrange
        var type = PersonalityType.FromCode("ENFP");

        // Act
        var description = type.GetDescription();

        // Assert
        description.Should().NotBeNullOrEmpty();
        description.Should().Contain("Enthusiastic");
    }
}
