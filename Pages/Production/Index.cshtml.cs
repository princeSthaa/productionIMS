using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
  public class IndexModel : PageModel
  {
    private void LoadProductionMenu()
    {
      ViewData["SidebarTitle"] = "Production Menu";

      ViewData["SidebarLinks"] = new List<(string Name, string Url, string Icon)>
            {
                ("Overview", "/Production/Index", "dashboard"),
                ("Plans", "/Production/PlansDetails", "assignment"),
                ("Demands", "/Production/Create", "dynamic_feed")
            };
    }

    public void OnGet()
    {
      LoadProductionMenu();
    }
  }
}
