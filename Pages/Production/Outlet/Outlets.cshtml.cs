using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class OutletsModel : ProductionBasePageModel
    {
        public void OnGet()
        {
            LoadSidebarMenu();
        }
    }
}
