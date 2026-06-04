using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class PlansDetailsModel : ProductionBasePageModel
    {
        public string PlanNo { get; set; } = "PP-20260602-001";

        public void OnGet(string? id)
        {
            LoadSidebarMenu();

            if (!string.IsNullOrWhiteSpace(id))
            {
                PlanNo = id;
            }
        }
    }
}
