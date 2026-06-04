using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
  public class IndexModel : ProductionBasePageModel
  {
    public void OnGet()
    {
      LoadSidebarMenu();
    }
  }
}
