using Microsoft.AspNetCore.SignalR;

namespace MiniChatRoom.Hubs
{
    public class ChatHub : Hub
    {
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
    }
}
