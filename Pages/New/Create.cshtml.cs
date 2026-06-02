using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.New
{
    public class CreateModel : PageModel
    {
        public string PageTitle { get; set; } = "Create Production Plan";

        public void OnGet()
        {
        }
    }
}