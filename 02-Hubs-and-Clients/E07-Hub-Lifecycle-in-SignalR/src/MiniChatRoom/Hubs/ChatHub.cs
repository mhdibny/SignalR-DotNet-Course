using Microsoft.AspNetCore.SignalR;

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

        public async Task SendMessageToHub(string username, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", username, message);
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
