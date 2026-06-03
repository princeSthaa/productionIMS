using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace kaam.Pages.CRM;

public class CreateOrder : CRMBasePageModel
{
  // 1. Catch the ID from the URL automatically
  [BindProperty(SupportsGet = true)]
  public required string CustomerId { get; set; }

  public void OnGet()
  {
    LoadSidebarMenu();
  }
}
