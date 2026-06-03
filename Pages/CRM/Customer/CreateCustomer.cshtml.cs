using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace kaam.Pages.CRM;

public class CreateCustomer : CRMBasePageModel
{
  public void OnGet()
  {
    LoadSidebarMenu();
  }
}
