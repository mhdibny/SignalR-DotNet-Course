using Microsoft.AspNetCore.SignalR;
using OnlineWhiteboard.Models;

namespace OnlineWhiteboard.Hubs
{
    public class OnlineWhiteboard : Hub
    {
        public async Task Draw(DrawSegment segment)
        {
            await Clients.Others.SendAsync("DrawReceived", segment);
        }
    }
}
