using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace Kaam.Pages.Warehouse;

public abstract class WarehouseBasePageModel : PageModel
{
    protected void LoadSidebarMenu()
    {
        ViewData["SidebarTitle"] = "Warehouse Menu";

        ViewData["SidebarLinks"] = new List<(string Name, string Url, string Icon)>
        {
            ("Overview", "/Warehouse/Index", "dashboard"),
            ("Stock", "/Warehouse/Stock", "inventory"),
            ("Visualization", "/Warehouse/Visualization", "visibility")
        };
    }
}