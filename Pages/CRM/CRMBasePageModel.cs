using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace kaam.Pages.CRM;

public abstract class CRMBasePageModel : PageModel
{
    protected void LoadSidebarMenu()
    {
        ViewData["SidebarTitle"] = "Customer Management";

        ViewData["SidebarLinks"] = new List<(string Name, string Url, string Icon)>
        {
            ("Overview", "/CRM/Index", "dashboard"),
            ("Create Customer", "/CRM/Customer/CreateCustomer", "add_circle"),
            ("Create Order", "/CRM/Order/CreateOrder", "add_circle")
        };
    }
}
