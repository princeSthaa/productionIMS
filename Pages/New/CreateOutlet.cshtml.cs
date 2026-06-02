using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.New
{
    public class CreateOutletModel : PageModel
    {
        [BindProperty]
        public string PlanNo { get; set; } = string.Empty;

        [BindProperty]
        public DateTime PlanDate { get; set; }

        [BindProperty]
        public string DemandType { get; set; } = "Outlet Replenishment";

        [BindProperty]
        public string? OutletId { get; set; }

        [BindProperty]
        public string? ProductId { get; set; }

        [BindProperty]
        public string? Variant { get; set; }

        [BindProperty]
        public int TotalQuantity { get; set; }

        [BindProperty]
        public DateTime? RequiredDate { get; set; }

        [BindProperty]
        public DateTime? PlannedStartDate { get; set; }

        [BindProperty]
        public DateTime? PlannedCompletionDate { get; set; }

        [BindProperty]
        public string Priority { get; set; } = "Normal";

        [BindProperty]
        public string? OutputDestination { get; set; } = "Outlet Transfer";

        [BindProperty]
        public string ActionType { get; set; } = string.Empty;

        public string? SuccessMessage { get; set; }

        public string? ErrorMessage { get; set; }

        public void OnGet()
        {
            LoadDefaultValues();
        }

        public IActionResult OnPost()
        {
            DemandType = "Outlet Replenishment";

            ValidateCommonFields();

            if (string.IsNullOrWhiteSpace(OutletId))
            {
                ModelState.AddModelError(nameof(OutletId), "Please select an outlet.");
            }

            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please fix the highlighted errors before continuing.";

                if (string.IsNullOrWhiteSpace(PlanNo))
                {
                    PlanNo = GeneratePlanNo();
                }

                if (PlanDate == default)
                {
                    PlanDate = DateTime.Today;
                }

                return Page();
            }

            if (ActionType == "Draft")
            {
                SuccessMessage = $"Outlet replenishment plan {PlanNo} saved as draft successfully.";
            }
            else
            {
                SuccessMessage = $"Outlet replenishment plan {PlanNo} created successfully. This is a demo save only.";
            }

            return Page();
        }

        private void LoadDefaultValues()
        {
            PlanNo = GeneratePlanNo();
            PlanDate = DateTime.Today;
            DemandType = "Outlet Replenishment";
            Priority = "Normal";
            OutputDestination = "Outlet Transfer";
        }

        private string GeneratePlanNo()
        {
            return $"PP-OUT-{DateTime.Now:yyyyMMdd-HHmm}";
        }

        private void ValidateCommonFields()
        {
            if (string.IsNullOrWhiteSpace(ProductId))
            {
                ModelState.AddModelError(nameof(ProductId), "Product is required.");
            }

            if (TotalQuantity <= 0)
            {
                ModelState.AddModelError(nameof(TotalQuantity), "Total quantity must be greater than zero.");
            }

            if (!RequiredDate.HasValue)
            {
                ModelState.AddModelError(nameof(RequiredDate), "Required date is required.");
            }

            if (!PlannedStartDate.HasValue)
            {
                ModelState.AddModelError(nameof(PlannedStartDate), "Planned start date is required.");
            }

            if (!PlannedCompletionDate.HasValue)
            {
                ModelState.AddModelError(nameof(PlannedCompletionDate), "Planned completion date is required.");
            }

            if (PlannedStartDate.HasValue && PlannedStartDate.Value.Date < PlanDate.Date)
            {
                ModelState.AddModelError(nameof(PlannedStartDate), "Planned start date cannot be before plan date.");
            }

            if (PlannedStartDate.HasValue &&
                PlannedCompletionDate.HasValue &&
                PlannedCompletionDate.Value.Date < PlannedStartDate.Value.Date)
            {
                ModelState.AddModelError(nameof(PlannedCompletionDate), "Planned completion date cannot be before planned start date.");
            }

            if (PlannedCompletionDate.HasValue &&
                RequiredDate.HasValue &&
                PlannedCompletionDate.Value.Date > RequiredDate.Value.Date)
            {
                ModelState.AddModelError(nameof(PlannedCompletionDate), "Planned completion date cannot be after required date.");
            }

            if (string.IsNullOrWhiteSpace(OutputDestination))
            {
                ModelState.AddModelError(nameof(OutputDestination), "Output destination is required.");
            }
        }
    }
}