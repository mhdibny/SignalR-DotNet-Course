namespace SignalRChatRoom.Services
{
    public class RoomPresenceStore
    {
        private readonly Dictionary<string, RoomMember> _members = new();
        private readonly object _lock = new();

        public void AddMember(string connectionId, string roomName, string username)
        {
            lock (_lock)
            {
                _members[connectionId] = new RoomMember()
                {
                    RoomName = roomName,
                    Username = username
                };
            }
        }

        public void RemoveMember(string connectionId)
        {
            lock (_lock)
            {
                _members.Remove(connectionId);
            }
        }

        public List<string> GetMembers(string roomName)
        {
            lock (_lock)
            {
                return _members.Values
                    .Where(member => member.RoomName == roomName)
                    .Select(member => member.Username)
                    .ToList();
            }
        }
    }

    public class RoomMember
    {
        public string RoomName { get; init; } = "";
        public string Username { get; init; } = "";
    }
}
