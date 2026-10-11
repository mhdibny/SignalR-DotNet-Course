using Microsoft.AspNetCore.SignalR;

namespace Quiz.Hubs
{
    public class QuizHub : Hub
    {

        public bool CheckAnswer(string answer)
        {
            //    Thread.Sleep(3000);

         //   throw new Exception();
            return answer == "signalr";

            //if (answer == "signalr")
            //{
            //    return true;
            //}
            //else
            //{
            //    return false;
            //}

        }

    }
}
