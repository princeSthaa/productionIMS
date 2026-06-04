using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kaam.Pages.Production
{
    public class CreateInHouseModel : ProductionBasePageModel
    {
        [BindProperty]
        public string PlanNo { get; set; } = string.Empty;

        [BindProperty]
        public DateTime PlanDate { get; set; }

        [BindProperty]
        public string DemandType { get; set; } = "In-house Stock";

        [BindProperty]
        public string? InHouseReason { get; set; }

        [BindProperty]
        public string? WarehouseId { get; set; }

        [BindProperty]
        public string? ProductId { get; set; }

        [BindProperty]
        public string? Variant { get; set; }

        [BindProperty]
        public string VariantBreakdownJson { get; set; } = string.Empty;

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
        public string? OutputDestination { get; set; } = "Finished Goods Warehouse";

        [BindProperty]
        public string ActionType { get; set; } = string.Empty;

        public string? SuccessMessage { get; set; }

        public string? ErrorMessage { get; set; }

        public void OnGet()
        {
            LoadSidebarMenu();
            LoadDefaultValues();
        }

        public IActionResult OnPost()
        {
            DemandType = "In-house Stock";

            ValidateCommonFields();

            if (string.IsNullOrWhiteSpace(InHouseReason))
            {
                ModelState.AddModelError(nameof(InHouseReason), "In-house reason is required.");
            }

            if (string.IsNullOrWhiteSpace(WarehouseId))
            {
                ModelState.AddModelError(nameof(WarehouseId), "Warehouse is required.");
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
                SuccessMessage = $"In-house production plan {PlanNo} saved as draft successfully.";
            }
            else
            {
                SuccessMessage = $"In-house production plan {PlanNo} created successfully. This is a demo save only.";
            }

            return Page();
        }

        private void LoadDefaultValues()
        {
            PlanNo = GeneratePlanNo();
            PlanDate = DateTime.Today;
            DemandType = "In-house Stock";
            Priority = "Normal";
            OutputDestination = "Finished Goods Warehouse";
        }

        private string GeneratePlanNo()
        {
            return $"PP-INH-{DateTime.Now:yyyyMMdd-HHmm}";
        }

        private void ValidateCommonFields()
        {
            if (string.IsNullOrWhiteSpace(ProductId))
            {
                ModelState.AddModelError(nameof(ProductId), "Product is required.");
            }

            if (!TryReadVariantBreakdown(VariantBreakdownJson, out var variantTotal, out var variantSummary))
            {
                ModelState.AddModelError(nameof(VariantBreakdownJson), "At least one color variant quantity is required.");
            }
            else
            {
                Variant = variantSummary;

                if (TotalQuantity <= 0)
                {
                    TotalQuantity = variantTotal;
                }

                if (TotalQuantity != variantTotal)
                {
                    ModelState.AddModelError(nameof(TotalQuantity), "Total quantity must match color variant quantities.");
                }
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

        private static bool TryReadVariantBreakdown(string json, out int totalQuantity, out string variantSummary)
        {
            totalQuantity = 0;
            variantSummary = string.Empty;

            if (string.IsNullOrWhiteSpace(json))
            {
                return false;
            }

            try
            {
                using var document = JsonDocument.Parse(json);

                if (document.RootElement.ValueKind != JsonValueKind.Array)
                {
                    return false;
                }

                var variants = new List<string>();

                foreach (var row in document.RootElement.EnumerateArray())
                {
                    if (!row.TryGetProperty("variant", out var variantElement) ||
                        !row.TryGetProperty("quantity", out var quantityElement))
                    {
                        return false;
                    }

                    var variant = variantElement.GetString();
                    var quantity = quantityElement.GetInt32();

                    if (string.IsNullOrWhiteSpace(variant) || quantity <= 0)
                    {
                        return false;
                    }

                    variants.Add(variant);
                    totalQuantity += quantity;
                }

                variantSummary = string.Join(" / ", variants.Distinct());
                return totalQuantity > 0;
            }
            catch (JsonException)
            {
                return false;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
        }
    }
}
