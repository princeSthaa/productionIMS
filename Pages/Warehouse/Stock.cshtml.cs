using Microsoft.AspNetCore.Mvc.RazorPages;

namespace kaam.Pages.Warehouse
{
    public class StockModel : PageModel
    {
        public List<StockItemViewModel> StockItems { get; set; } = new();

        public void OnGet()
        {
            StockItems = new List<StockItemViewModel>
            {
                new StockItemViewModel
                {
                    Sku = "RM-001",
                    Name = "Cotton Fabric",
                    Type = "Raw Material",
                    Quantity = 120,
                    Uom = "kg",
                    Location = "Rack A / Bin 01",
                    Status = "Available",
                    StatusClass = "success"
                },
                new StockItemViewModel
                {
                    Sku = "FG-001",
                    Name = "School Uniform",
                    Type = "Finished Goods",
                    Quantity = 45,
                    Uom = "pcs",
                    Location = "Rack F / Bin 04",
                    Status = "Ready",
                    StatusClass = "primary"
                }
            };
        }
    }

    public class StockItemViewModel
    {
        public string Sku { get; set; } = "";
        public string Name { get; set; } = "";
        public string Type { get; set; } = "";
        public int Quantity { get; set; }
        public string Uom { get; set; } = "";
        public string Location { get; set; } = "";
        public string Status { get; set; } = "";
        public string StatusClass { get; set; } = "secondary";
    }
}