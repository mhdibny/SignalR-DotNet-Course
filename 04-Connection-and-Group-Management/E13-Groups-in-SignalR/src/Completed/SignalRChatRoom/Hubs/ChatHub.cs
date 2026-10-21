using Microsoft.AspNetCore.SignalR;

namespace SignalRChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        private const string CurrentRoomKey = "CurrentRoom";
        private static readonly HashSet<string> AllowedRooms =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "general", "signalr", "dotnet"
            };

        private string? GetCurrentRoom()
        {
            return Context.Items
                .TryGetValue(CurrentRoomKey, out var room)
                ? room as string
                : null;
        }

        public async Task<bool> JoinRoom(string roomName)
        {
            if (AllowedRooms.Contains(roomName) is false)
            {
                return false;
            }

            var currentRoom = GetCurrentRoom();
            if (currentRoom == roomName)
            {
                return true;
            }

            if (currentRoom is not null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, currentRoom);
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            Context.Items[CurrentRoomKey] = roomName;

            return true;

        }

        public async Task<bool> LeaveRoom()
        {
            var currentRoom = GetCurrentRoom();
            if (currentRoom is null)
            {
                return false;
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, currentRoom);

            Context.Items.Remove(CurrentRoomKey);

            return true;
        }

        public async Task<bool> SendMessage(string username, string message)
        {
            var currentRoom = GetCurrentRoom();
            if (currentRoom is null)
            {
                return false;
            }

            await Clients.Groups(currentRoom).SendAsync(
                    "ReceiveMessage",
                    currentRoom,
                    username,
                    message,
                    DateTimeOffset.UtcNow
                );

            return true;
        }

    }
}
