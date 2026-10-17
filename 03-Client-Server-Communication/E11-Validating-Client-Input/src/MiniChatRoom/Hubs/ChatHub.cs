using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.SignalR;
using MiniChatRoom.Models;

namespace MiniChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        private readonly Guid _instanceId = Guid.NewGuid();

        public async Task TestHubInstance()
        {
            await Clients.Caller.SendAsync("ReceivedHubInstanceId", _instanceId);
        }

        public override Task OnConnectedAsync()
        {
            Console.Write("Client connected: ");

            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(Context.ConnectionId);
            Console.ResetColor();
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {

            Console.Write("Client disconnected: ");

            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(Context.ConnectionId);
            Console.ResetColor();
            return base.OnDisconnectedAsync(exception);
        }



        private async Task SendErrorToCallerAsync(IEnumerable<string> errors)
        {
            await Clients.Caller.SendAsync("ShowError", errors.ToArray());
        }

        public async Task<bool> SendMessageToHub(ChatMessageRequest? request)
        {
            #region Validation

            if (request is null)
            {
                await SendErrorToCallerAsync(new[] { "لطفا اطلاعات را وارد کنید." });
                return false;
            }

            var result = new List<ValidationResult>();
            var context = new ValidationContext(request);
            var isValid = Validator.TryValidateObject(
                request,
                context,
                result,
                validateAllProperties: true
            );

            if (isValid is false)
            {
                var errors = result.Select(s => s.ErrorMessage).ToList();
                await SendErrorToCallerAsync(errors);
                return false;
            }

            #endregion



            await Clients.All.SendAsync("ReceiveMessage", request.Username, request.Message);
            return true;
        }

        public async Task GetConnectionId()
        {
            await Clients.Caller.SendAsync("ReceiveConnectionId", Context.ConnectionId);
        }

        public async Task SendMessageToOthers()
        {
            await Clients.Others.SendAsync("ReceiveMessage", "سیستم", DateTime.Now.ToString());
        }

        public async Task SendMessageToTargetConnectionId(string connectionId, string username, string message)
        {
            await Clients.Client(connectionId).SendAsync("MyConnectionReceivedMessages", username, message);
        }
    }
}
