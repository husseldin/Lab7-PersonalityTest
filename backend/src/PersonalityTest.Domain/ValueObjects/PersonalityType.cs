namespace PersonalityTest.Domain.ValueObjects;

public record PersonalityType
{
    public string Code { get; }

    private static readonly Dictionary<string, (string Name, string Description)> TypeInfo = new()
    {
        ["INTJ"] = ("Architect", "Strategic, analytical, and independent thinkers"),
        ["INTP"] = ("Logician", "Innovative inventors with a thirst for knowledge"),
        ["ENTJ"] = ("Commander", "Bold, imaginative, and strong-willed leaders"),
        ["ENTP"] = ("Debater", "Smart and curious thinkers who love intellectual challenges"),
        ["INFJ"] = ("Advocate", "Quiet and mystical, yet inspiring and tireless idealists"),
        ["INFP"] = ("Mediator", "Poetic, kind, and altruistic, always eager to help"),
        ["ENFJ"] = ("Protagonist", "Charismatic and inspiring leaders, able to mesmerize"),
        ["ENFP"] = ("Campaigner", "Enthusiastic, creative, and sociable free spirits"),
        ["ISTJ"] = ("Logistician", "Practical and fact-minded, reliable and dependable"),
        ["ISFJ"] = ("Defender", "Dedicated and warm protectors, always ready to defend loved ones"),
        ["ESTJ"] = ("Executive", "Excellent administrators, unsurpassed at managing things"),
        ["ESFJ"] = ("Consul", "Caring and social, always eager to help and to please"),
        ["ISTP"] = ("Virtuoso", "Bold and practical experimenters, masters of tools"),
        ["ISFP"] = ("Adventurer", "Flexible and charming artists, always ready to explore"),
        ["ESTP"] = ("Entrepreneur", "Smart, energetic, and perceptive, living on the edge"),
        ["ESFP"] = ("Entertainer", "Spontaneous, energetic, and enthusiastic entertainers")
    };

    private PersonalityType(string code)
    {
        if (!TypeInfo.ContainsKey(code))
            throw new ArgumentException($"Invalid personality type code: {code}");

        Code = code;
    }

    public static PersonalityType FromCode(string code)
    {
        return new PersonalityType(code.ToUpperInvariant());
    }

    public static PersonalityType FromScores(int scoreE, int scoreI, int scoreS, int scoreN,
                                            int scoreT, int scoreF, int scoreJ, int scoreP)
    {
        var code = string.Empty;

        // Apply tie-break rules: if equal, default to I, N, F, P (research-backed defaults)
        code += scoreE > scoreI ? "E" : "I";
        code += scoreN >= scoreS ? "N" : "S";
        code += scoreF >= scoreT ? "F" : "T";
        code += scoreP >= scoreJ ? "P" : "J";

        return new PersonalityType(code);
    }

    public string GetName() => TypeInfo[Code].Name;
    public string GetDescription() => TypeInfo[Code].Description;

    public override string ToString() => Code;
}
