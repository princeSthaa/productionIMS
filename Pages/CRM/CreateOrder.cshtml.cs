using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace kaam.Pages.CRM;

public class CreateOrder : PageModel
{
  // 1. Catch the ID from the URL automatically
  [BindProperty(SupportsGet = true)]
  public required string CustomerId { get; set; }

  private void LoadOrderMenu()
  {
    ViewData["SidebarTitle"] = "Customer Management";

    ViewData["SidebarLinks"] = new List<(string Name, string Url, string Icon)>
        {
            ("Overview", "/CRM/Index", "dashboard"),
            ("Create Customer", "/CRM/CreateCustomer", "add_circle"),
            ("Create Order", "/CRM/CreateOustomer", "add_circle")
        };
  }

  public void OnGet()
  {
    LoadOrderMenu();
  }
}
