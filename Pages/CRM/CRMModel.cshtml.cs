using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace kaam.Pages.CRM;

public class CRMModel : CRMBasePageModel
{
  public void OnGet()
  {
    LoadSidebarMenu();
  }
}
