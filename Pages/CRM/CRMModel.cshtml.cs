using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace kaam.Pages.CRM;

public class CRMModel : PageModel
{
  private void LoadCRMMenu()
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
    LoadCRMMenu();
  }
}
