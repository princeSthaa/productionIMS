using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace Kaam.Pages.Production;

public abstract class ProductionBasePageModel : PageModel
{
    protected void LoadSidebarMenu()
    {
        ViewData["SidebarTitle"] = "Production Menu";

        ViewData["SidebarLinks"] = new List<(string Name, string Url, string Icon)>
        {
            ("Overview", "/Production/Index", "dashboard"),
            ("Drafts", "/Production/Drafts", "edit_note"),
            ("In Progress", "/Production/InProgress", "precision_manufacturing"),
            ("Completed", "/Production/Completed", "task_alt"),
            ("Plans", "/Production/Plan/PlansDetails", "assignment"),
            ("Demands", "/Production/Create", "dynamic_feed")
        };
    }
}
