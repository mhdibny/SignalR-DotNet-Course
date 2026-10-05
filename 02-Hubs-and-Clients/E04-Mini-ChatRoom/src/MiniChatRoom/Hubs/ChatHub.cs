using Microsoft.AspNetCore.SignalR;

namespace MiniChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessageToHub(string username, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", username, message);
        }
    }
}
