using System.ComponentModel.DataAnnotations;

namespace MiniChatRoom.Models
{
    public class ChatMessageRequest
    {
        [Display(Name = "نام کاربری")]
        [Required(ErrorMessage = "{0} را وارد کنید")]
        [StringLength(20,ErrorMessage = "{0} نمیتواند بیشتر از {1} باشد.")]
        public string Username { get; set; }

        [Display(Name = "متن پیام")]
        [Required(ErrorMessage = "{0} را وارد کنید")]
        [StringLength(20, ErrorMessage = "{0} نمیتواند بیشتر از {1} باشد.")]
        public string Message { get; set; }
    }
}
