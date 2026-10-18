using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
