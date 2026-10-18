#region Usings

using Exam.Models;
using Exam.Services;
using Microsoft.AspNetCore.SignalR;

#endregion

namespace Exam.Hubs
{
    public class QuizHub : Hub
    {
        #region Constructor & Dependencies

        private readonly QuizService _quiz;

        public QuizHub(QuizService quiz)
        {
            _quiz = quiz;
        }

        #endregion

        public int GetTotalQuestionsAsync()
        {
            return _quiz.TotalQuestions;
        }

        public async Task<QuestionDto?> GetQuestionAsync(int questionId)
        {
            if (questionId <= 0)
            {
                await SendErrorAsync("شناسه سوال باید بزرگ‌تر از صفر باشد.");
                return null;
            }

            var question = _quiz.FindQuestion(questionId);
            if (question == null)
            {
                await SendErrorAsync($"سوالی با شماره {questionId} وجود ندارد.");
                return null;
            }

            return new QuestionDto(
                question.Id,
                question.Text,
                question.Options
                    .Select(o => new OptionDto(o.Id, o.Text))
                    .ToList());
        }

        public async Task<SubmitAnswerResult?> SubmitAnswerAsync(int questionId, int optionId)
        {
            var question = _quiz.FindQuestion(questionId);
            if (question == null)
            {
                await SendErrorAsync($"سوالی با شماره {questionId} وجود ندارد.");
                return null;
            }

            if (question.Options.Any(o => o.Id == optionId) is false)
            {
                await SendErrorAsync($"گزینه {optionId} برای سوال {questionId} معتبر نیست.");
                return null;
            }

            if (_quiz.HasAnswered(Context.ConnectionId, questionId))
            {
                await SendErrorAsync("شما قبلاً به این سوال پاسخ داده‌اید.");
                return null;
            }

            _quiz.SaveAnswer(Context.ConnectionId, questionId, optionId);

            return new SubmitAnswerResult(
                QuestionId: questionId,
                IsCorrect: question.CorrectOptionId == optionId,
                CorrectOptionId: question.CorrectOptionId,
                Score: _quiz.GetScore(Context.ConnectionId));
        }

        public async Task<ScoreResult> GetScoreAsync()
        {
            return new ScoreResult(
                Score: _quiz.GetScore(Context.ConnectionId),
                Answered: _quiz.GetAnsweredCount(Context.ConnectionId),
                Total: _quiz.TotalQuestions);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _quiz.ClearConnection(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        private Task SendErrorAsync(string message)
        {
            return Clients.Caller.SendAsync("ReceiveError", message);
        }
    }
}
