using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class CreateModel : ProductionBasePageModel
    {
        public string PageTitle { get; set; } = "Create Production Plan";

        public void OnGet()
        {
            LoadSidebarMenu();
        }
    }
}
