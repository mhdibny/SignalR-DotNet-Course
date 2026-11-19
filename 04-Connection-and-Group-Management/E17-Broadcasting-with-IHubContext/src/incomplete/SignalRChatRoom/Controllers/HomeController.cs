using Microsoft.AspNetCore.Mvc;

namespace SignalRChatRoom.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
