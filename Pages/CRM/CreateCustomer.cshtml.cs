using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace kaam.Pages.CRM;

public class CreateCustomer : PageModel
{
  private void LoadCustomerCreateMenu()
  {
    ViewData["SidebarTitle"] = "Customer Management";

    ViewData["SidebarLinks"] = new List<(string Name, string Url, string Icon)>
            {
                ("Overview", "/Production/Index", "dashboard"),
                ("Create Customer", "/CRM/CreateCustomer", "add_circle"),
                ("Create Order", "/CRM/CreateOustomer", "add_circle")
            };
  }
  public void OnGet() 
  {
    LoadCustomerCreateMenu();
  }
}
