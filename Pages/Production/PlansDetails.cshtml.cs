using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class PlansDetailsModel : PageModel
    {
        public string PlanNo { get; set; } = "PP-20260602-001";

        private void LoadProductionMenu()
        {
            ViewData["SidebarTitle"] = "Production Menu";

            ViewData["SidebarLinks"] = new List<(string Name, string Url, string Icon)>
            {
                ("Overview", "/Production/Index", "dashboard"),
                ("Plans", "/Production/PlansDetails", "assignment"),
                ("Create Plan", "/Production/Create", "add_circle")
            };
        }

        public void OnGet(string? id)
        {
            LoadProductionMenu();

            if (!string.IsNullOrWhiteSpace(id))
            {
                PlanNo = id;
            }
        }
    }
}