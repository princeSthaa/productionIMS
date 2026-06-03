using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class CreateCustomerModel : PageModel
    {
        [BindProperty(SupportsGet = true)]
        public int? CustomerId { get; set; }

        [BindProperty]
        public string DemandType { get; set; } = "Customer Order";

        [BindProperty]
        public string SelectedDraftJson { get; set; } = string.Empty;

        [BindProperty]
        public string ActionType { get; set; } = string.Empty;

        [TempData]
        public string? SuccessMessage { get; set; }

        [TempData]
        public string? ErrorMessage { get; set; }

        public void OnGet()
        {
            DemandType = "Customer Order";
        }

        public IActionResult OnPost()
        {
            DemandType = "Customer Order";

            if (string.IsNullOrWhiteSpace(SelectedDraftJson))
            {
                ErrorMessage = "Please add at least one customer order item to the production plan.";
                return Page();
            }

            /*
                Later database save flow:

                1. Read SelectedDraftJson.
                2. Convert selected customer order items into ProductionPlan.
                3. Insert ProductionPlan header.
                4. Insert ProductionPlanItems.
                5. Insert size breakdown rows.
                6. Calculate material requirements from BOM.
                7. Optional: create MaterialReservations.
                8. Update CustomerOrderItem status to Planned.

                For now, this page uses mock JS data and only validates that
                at least one item was selected.
            */

            SuccessMessage = $"Production plan created successfully. Plan No: {GeneratePlanNo()}";

            return RedirectToPage();
        }

        private string GeneratePlanNo()
        {
            return $"CPP-{DateTime.Now:yyyyMMdd-HHmmss}";
        }
    }
}
