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
                ("Create Plan", "/Production/Create", "add_circle")
            };
    }

    public void OnGet()
    {
      LoadProductionMenu();
    }
  }
}
