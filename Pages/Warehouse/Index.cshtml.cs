using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Warehouse;

public class IndexModel : WarehouseBasePageModel
{
    public void OnGet()
    {
            LoadSidebarMenu();
    }
}
