using Microsoft.AspNetCore.SignalR;
using OnlineWhiteboard.Models;
using OnlineWhiteboard.Services;

namespace OnlineWhiteboard.Hubs
{
    public class OnlineWhiteboard : Hub
    {
        private readonly WhiteboardStore _store;

        public OnlineWhiteboard(WhiteboardStore store)
        {
            _store = store;
        }

        public async Task Draw(DrawSegment segment)
        {
            _store.Add(segment);
            await Clients.Others.SendAsync("DrawReceived", segment);
        }

        public async override Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();

            var segments = _store.GetSnapshot();
            await Clients.Caller.SendAsync("LoadDrawing",segments);
        }
    }
}
