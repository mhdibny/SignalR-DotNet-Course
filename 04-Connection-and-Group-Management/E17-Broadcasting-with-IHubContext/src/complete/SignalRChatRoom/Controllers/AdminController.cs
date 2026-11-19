using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalRChatRoom.Hubs;

namespace SignalRChatRoom.Controllers
{
    public class AdminController : Controller
    {
        private IHubContext<ChatHub> _hubContext;
        public AdminController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendAnnouncement(string? title, string? message)
        {
            await _hubContext.Clients.All
                .SendAsync("ReceiveSiteAnnouncement", title, message);

            TempData["Success"] = "پیام با موفقیت ارسال شد.";

            return RedirectToAction(nameof(Index));
        }
    }
}
