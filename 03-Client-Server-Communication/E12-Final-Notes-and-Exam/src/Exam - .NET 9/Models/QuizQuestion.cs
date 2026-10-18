namespace Exam.Models
{
    public class QuizQuestion
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public List<QuizOption> Options { get; set; } = new();
        public int CorrectOptionId { get; set; }
    }
}
