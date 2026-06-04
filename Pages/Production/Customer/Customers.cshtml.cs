using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class CustomersModel : ProductionBasePageModel
    {
        public void OnGet()
        {
            LoadSidebarMenu();
        }
    }
}
