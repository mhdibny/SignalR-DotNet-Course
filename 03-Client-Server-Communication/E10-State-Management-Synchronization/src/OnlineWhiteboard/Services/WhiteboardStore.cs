using OnlineWhiteboard.Models;

namespace OnlineWhiteboard.Services
{
    public class WhiteboardStore
    {
        private readonly List<DrawSegment> _segments = new();
        private readonly object _lock = new();


        public void Add(DrawSegment segment)
        {
            lock (_lock)
            {
                _segments.Add(segment);
            }
        }

        public DrawSegment[] GetSnapshot()
        {
            lock (_lock)
            {
                return _segments.ToArray();
            }
        }
    }
}
