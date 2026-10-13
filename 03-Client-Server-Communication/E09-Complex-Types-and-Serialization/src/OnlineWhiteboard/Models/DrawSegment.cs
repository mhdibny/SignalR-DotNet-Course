namespace OnlineWhiteboard.Models
{
    public class DrawSegment
    {
        public double X1 { get; set; } 
        public double Y1 { get; set; }
        public double X2 { get; set; }
        public double Y2 { get; set; }
        public string Color { get; set; } = "#000000";
        public double LineWidth { get; set; } = 3;
    }
}
