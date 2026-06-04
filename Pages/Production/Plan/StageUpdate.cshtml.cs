using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class StageUpdateModel : ProductionBasePageModel
    {
        [BindProperty]
        public string PlanId { get; set; } = "PP-20260529-001";

        [BindProperty]
        public string PlanNo { get; set; } = string.Empty;

        [BindProperty]
        public string? SelectedStageId { get; set; }

        [BindProperty]
        public string? SelectedStageName { get; set; }

        [BindProperty]
        public DateTime? ActualStartDate { get; set; }

        [BindProperty]
        public DateTime? ActualEndDate { get; set; }

        [BindProperty]
        public int CompletedQty { get; set; }

        [BindProperty]
        public int RejectedQty { get; set; }

        [BindProperty]
        public string? Remarks { get; set; }

        [BindProperty]
        public string? StageStatus { get; set; }

        [BindProperty]
        public string ActionType { get; set; } = string.Empty;

        public string? SuccessMessage { get; set; }

        public string? ErrorMessage { get; set; }

        public void OnGet(string? id)
        {
            LoadSidebarMenu();
            if (!string.IsNullOrWhiteSpace(id))
            {
                PlanId = id;
                PlanNo = id;
            }
            else
            {
                PlanNo = PlanId;
            }
        }

        public IActionResult OnPost()
        {
            ValidateServerSide();

            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please fix the highlighted errors before saving the stage update.";

                if (string.IsNullOrWhiteSpace(PlanNo))
                {
                    PlanNo = PlanId;
                }

                return Page();
            }

            SuccessMessage =
                $"Stage update for {SelectedStageName ?? SelectedStageId} saved successfully. This is a demo save only.";

            return Page();
        }

        private void ValidateServerSide()
        {
            if (string.IsNullOrWhiteSpace(SelectedStageId))
            {
                ModelState.AddModelError(nameof(SelectedStageId), "Please select a production stage.");
            }

            if (string.IsNullOrWhiteSpace(StageStatus))
            {
                ModelState.AddModelError(nameof(StageStatus), "Please select stage status.");
            }

            if (CompletedQty < 0)
            {
                ModelState.AddModelError(nameof(CompletedQty), "Completed quantity cannot be negative.");
            }

            if (RejectedQty < 0)
            {
                ModelState.AddModelError(nameof(RejectedQty), "Rejected quantity cannot be negative.");
            }

            if (ActualStartDate.HasValue &&
                ActualEndDate.HasValue &&
                ActualEndDate.Value.Date < ActualStartDate.Value.Date)
            {
                ModelState.AddModelError(nameof(ActualEndDate), "Actual end date cannot be before actual start date.");
            }

            if (StageStatus == "Completed" && !ActualEndDate.HasValue)
            {
                ModelState.AddModelError(nameof(ActualEndDate), "Actual end date is required when stage is completed.");
            }

            if (StageStatus == "In Progress" && !ActualStartDate.HasValue)
            {
                ModelState.AddModelError(nameof(ActualStartDate), "Actual start date is required when stage is in progress.");
            }

            if (StageStatus == "Completed" && CompletedQty <= 0)
            {
                ModelState.AddModelError(nameof(CompletedQty), "Completed quantity must be greater than zero when stage is completed.");
            }
        }
    }
}
