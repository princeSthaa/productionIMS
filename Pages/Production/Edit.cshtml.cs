using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class EditModel : PageModel
    {
        [BindProperty]
        public string PlanId { get; set; } = "PP-20260529-001";

        [BindProperty]
        public string PlanNo { get; set; } = string.Empty;

        [BindProperty]
        public DateTime PlanDate { get; set; }

        [BindProperty]
        public string? DemandType { get; set; }

        [BindProperty]
        public string? CustomerId { get; set; }

        [BindProperty]
        public string? OutletId { get; set; }

        [BindProperty]
        public string? InHouseReason { get; set; }

        [BindProperty]
        public string? WarehouseId { get; set; }

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
        public string? OutputDestination { get; set; }

        [BindProperty]
        public string Status { get; set; } = "Draft";

        [BindProperty]
        public string ActionType { get; set; } = string.Empty;

        public string? SuccessMessage { get; set; }

        public string? ErrorMessage { get; set; }

        public void OnGet(string? id)
        {
            if (!string.IsNullOrWhiteSpace(id))
            {
                PlanId = id;
            }

            LoadDefaultValues();
        }

        public IActionResult OnPost()
        {
            ValidateServerSide();

            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please fix the highlighted errors before saving changes.";

                if (string.IsNullOrWhiteSpace(PlanNo))
                {
                    PlanNo = PlanId;
                }

                if (PlanDate == default)
                {
                    PlanDate = DateTime.Today;
                }

                return Page();
            }

            if (!string.Equals(Status, "Draft", StringComparison.OrdinalIgnoreCase))
            {
                ErrorMessage = "This production plan cannot be edited because only Draft plans are editable.";
                return Page();
            }

            SuccessMessage = $"Production plan {PlanNo} updated successfully. This is a demo save only.";

            return Page();
        }

        private void LoadDefaultValues()
        {
            // These values are placeholders.
            // The actual selected plan data is filled on the frontend
            // from wwwroot/data/mock-production-plans.js.

            PlanNo = PlanId;
            PlanDate = DateTime.Today;
            Priority = "Normal";
            Status = "Draft";
        }

        private void ValidateServerSide()
        {
            if (string.IsNullOrWhiteSpace(DemandType))
            {
                ModelState.AddModelError(nameof(DemandType), "Demand type is required.");
            }

            if (DemandType == "Customer Order" && string.IsNullOrWhiteSpace(CustomerId))
            {
                ModelState.AddModelError(nameof(CustomerId), "Please select a customer.");
            }

            if (DemandType == "Outlet Replenishment" && string.IsNullOrWhiteSpace(OutletId))
            {
                ModelState.AddModelError(nameof(OutletId), "Please select an outlet.");
            }

            if (DemandType == "In-house Stock")
            {
                if (string.IsNullOrWhiteSpace(InHouseReason))
                {
                    ModelState.AddModelError(nameof(InHouseReason), "In-house reason is required.");
                }

                if (string.IsNullOrWhiteSpace(WarehouseId))
                {
                    ModelState.AddModelError(nameof(WarehouseId), "Warehouse is required.");
                }
            }

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

            if (PlannedStartDate.HasValue && PlanDate != default)
            {
                if (PlannedStartDate.Value.Date < PlanDate.Date)
                {
                    ModelState.AddModelError(nameof(PlannedStartDate), "Planned start date cannot be before plan date.");
                }
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
