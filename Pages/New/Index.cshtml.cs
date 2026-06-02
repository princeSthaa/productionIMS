using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.New
{
    public class IndexModel : PageModel
    {
        public string PageTitle { get; set; } = "Production Plans";

        public string PageSubtitle { get; set; } =
            "View, filter, and manage garment production plans.";

        public void OnGet()
        {
            // For now this page uses mock JavaScript data from:
            // wwwroot/data/mock-production-plans.js
            //
            // Later, database/service logic can be added here.
        }
    }
}