namespace Exam.Models
{
    public record OptionDto(int Id, string Text);

    public record QuestionDto(int Id, string Text, List<OptionDto> Options);

    public record SubmitAnswerResult(
        int QuestionId,
        bool IsCorrect,
        int CorrectOptionId,
        int Score);

    public record ScoreResult(int Score, int Answered, int Total);
}
