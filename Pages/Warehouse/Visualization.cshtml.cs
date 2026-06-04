using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Warehouse
{
    public class VisualizationModel : WarehouseBasePageModel
    {
        public void OnGet()
        {
            LoadSidebarMenu();
        }
    }
}