#region Usings

using Exam.Models;
using System.Collections.Concurrent;
using System.Text.Json;

#endregion

namespace Exam.Services
{
    public class QuizService
    {
        private readonly IReadOnlyList<QuizQuestion> _questions;
        private readonly ConcurrentDictionary<string, ConcurrentDictionary<int, int>> _answers = new();

        public QuizService(IHostEnvironment env)
        {
            var path = Path.Combine(env.ContentRootPath, "questions.json");

            if (!File.Exists(path))
                throw new FileNotFoundException(
                    $"Questions file not found at: {path}. " +
                    "Please make sure questions.json exists in the project root.");

            string json;
            try
            {
                json = File.ReadAllText(path);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Failed to read questions.json: {ex.Message}", ex);
            }

            List<QuizQuestion>? questions;
            try
            {
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    ReadCommentHandling = JsonCommentHandling.Skip,
                    AllowTrailingCommas = true
                };
                questions = JsonSerializer.Deserialize<List<QuizQuestion>>(json, jsonOptions);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException(
                    $"questions.json is not valid JSON: {ex.Message}", ex);
            }

            if (questions == null || questions.Count == 0)
                throw new InvalidOperationException("questions.json contains no questions.");


            _questions = questions;
        }

        public int TotalQuestions => _questions.Count;

        public QuizQuestion? FindQuestion(int questionId)
        {
            foreach (var question in _questions)
            {
                if (question.Id == questionId)
                    return question;
            }

            return null;
        }

        public bool HasAnswered(string connectionId, int questionId)
        {
            if (!_answers.TryGetValue(connectionId, out var answers))
                return false;
            return answers.ContainsKey(questionId);
        }

        public void SaveAnswer(string connectionId, int questionId, int optionId)
        {
            var answers = _answers.GetOrAdd(
                connectionId,
                _ => new ConcurrentDictionary<int, int>());

            answers[questionId] = optionId;
        }

        public int GetScore(string connectionId)
        {
            if (!_answers.TryGetValue(connectionId, out var answers))
                return 0;

            int score = 0;
            foreach (var entry in answers)
            {
                var question = FindQuestion(entry.Key);
                if (question != null && question.CorrectOptionId == entry.Value)
                    score++;
            }

            return score;
        }

        public int GetAnsweredCount(string connectionId)
        {
            return _answers.TryGetValue(connectionId, out var answers)
                ? answers.Count
                : 0;
        }

        public void ClearConnection(string connectionId)
        {
            _answers.TryRemove(connectionId, out _);
        }
    }
}