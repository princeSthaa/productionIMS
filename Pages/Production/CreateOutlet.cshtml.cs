using System;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class CreateOutletModel : PageModel
    {
        [BindProperty(SupportsGet = true)]
        public int? OutletId { get; set; }

        [BindProperty]
        public string DemandType { get; set; } = "Outlet Demand";

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
            DemandType = "Outlet Demand";
        }

        public IActionResult OnPost()
        {
            DemandType = "Outlet Demand";

            if (!HasSelectedItems(SelectedDraftJson))
            {
                ErrorMessage = "Please add at least one outlet demand item to the production plan.";
                return Page();
            }

            /*
                Later database save flow:

                1. Read SelectedDraftJson.
                2. Create ProductionPlan header.
                3. Insert ProductionPlanItems from selected outlet demand items.
                4. Insert size-wise planned quantities.
                5. Calculate material requirements from BOM.
                6. Optional: reserve materials.
                7. Update OutletDemandItem status to Planned.
                8. Output destination should be outlet transfer / finished goods warehouse.

                For now this page uses mock JS data and only validates that
                at least one outlet demand item was selected.
            */

            SuccessMessage = $"Outlet production plan created successfully. Plan No: {GeneratePlanNo()}";

            return RedirectToPage();
        }

        private string GeneratePlanNo()
        {
            return $"OPP-{DateTime.Now:yyyyMMdd-HHmmss}";
        }

        private static bool HasSelectedItems(string selectedDraftJson)
        {
            if (string.IsNullOrWhiteSpace(selectedDraftJson))
            {
                return false;
            }

            try
            {
                using var document = JsonDocument.Parse(selectedDraftJson);
                return document.RootElement.ValueKind == JsonValueKind.Array
                    && document.RootElement.GetArrayLength() > 0;
            }
            catch (JsonException)
            {
                return false;
            }
        }
    }
}
