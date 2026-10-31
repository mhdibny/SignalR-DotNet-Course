#region Usings

using Microsoft.AspNetCore.SignalR;

#endregion

namespace SignalRChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        #region Constants & Fields

        private const string CurrentRoomKey = "CurrentRoom";
        private const string CurrentUsernameKey = "CurrentUsername";
        private static readonly HashSet<string> AllowedRooms =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "general", "signalr", "dotnet"
            };

        #endregion

        #region Private Helpers

        private string? GetCurrentRoom()
        {
            return Context.Items
                .TryGetValue(CurrentRoomKey, out var room)
                ? room as string
                : null;
        }

        private string? GetCurrentUsername()
        {
            return Context.Items
                .TryGetValue(CurrentUsernameKey, out var username)
                ? username as string
                : null;
        }


        #endregion


        public async Task<bool> JoinRoom(string roomName, string username)
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

                await Clients.OthersInGroup(currentRoom)
                    .SendAsync("UserLeft", currentRoom, username);
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            Context.Items[CurrentRoomKey] = roomName;
            Context.Items[CurrentUsernameKey] = username;

            await Clients.OthersInGroup(roomName)
                .SendAsync("UserJoined", roomName, username);

            return true;

        }

        public async Task<bool> LeaveRoom()
        {
            var currentRoom = GetCurrentRoom();
            var username = GetCurrentUsername() ?? "یک کاربر";
            if (currentRoom is null)
            {
                return false;
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, currentRoom);

            await Clients.OthersInGroup(currentRoom)
                .SendAsync("UserLeft", currentRoom, username);

            Context.Items.Remove(CurrentRoomKey);
            Context.Items.Remove(CurrentUsernameKey);

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

        public async override Task OnDisconnectedAsync(Exception? exception)
        {
            var username = GetCurrentUsername();
            var roomName = GetCurrentRoom();
            if (username is not null && roomName is not null)
            {
                await Clients.OthersInGroup(roomName)
                    .SendAsync("UserLeft", roomName, username);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
