using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class DetailsModel : PageModel
    {
        public string PageTitle { get; set; } = "Production Plan Details";

        public string PageSubtitle { get; set; } =
            "View production plan summary, materials, stages, size breakdown, and activity.";

        public string PlanId { get; set; } = "PP-20260529-001";

        public void OnGet(string? id)
        {
            // For now, details are loaded from JavaScript mock data:
            // wwwroot/data/mock-production-plans.js
            //
            // The id from the route is passed to the hidden field in Details.cshtml.
            // production-plan-details.js will use this value to find the selected mock plan.

            if (!string.IsNullOrWhiteSpace(id))
            {
                PlanId = id;
            }
        }
    }
}
