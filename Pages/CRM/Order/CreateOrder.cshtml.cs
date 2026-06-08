using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace kaam.Pages.CRM;

public class FabricViewModel
{
  public string Id { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string ImageUrl { get; set; } = string.Empty;
}

public class CustomerViewModel
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Orders { get; set; }
}

public class CreateOrder : CRMBasePageModel
{
  [BindProperty(SupportsGet = true)]
  public string? CustomerId { get; set; }
  
  public CustomerViewModel? SelectedCustomer { get; set; }

  public List<FabricViewModel> Fabrics { get; set; } = new();

  public void OnGet()
  {
    LoadSidebarMenu();

    if (!string.IsNullOrEmpty(CustomerId))
    {
        // Mocking the backend DB fetch
        var allCustomers = new List<CustomerViewModel>
        {
            new CustomerViewModel { Id = "CUS-1001", Name = "Ram Bahadur Thapa", Phone = "9841000000", Email = "ram@example.com", Location = "Kathmandu, Bagmati", Type = "Retail", Orders = 12 },
            new CustomerViewModel { Id = "CUS-1002", Name = "Sita Sharma", Phone = "9851000000", Email = "sita@example.com", Location = "Pokhara, Gandaki", Type = "Wholesale", Orders = 45 },
            new CustomerViewModel { Id = "CUS-1003", Name = "Hari Khadka", Phone = "9801000000", Email = "hari@example.com", Location = "Biratnagar, Koshi", Type = "Distributor", Orders = 120 },
            new CustomerViewModel { Id = "CUS-1004", Name = "Gita Shrestha", Phone = "9861000000", Email = "gita@example.com", Location = "Lalitpur, Bagmati", Type = "Retail", Orders = 2 },
            new CustomerViewModel { Id = "CUS-1005", Name = "Bishnu Rai", Phone = "9811000000", Email = "bishnu@example.com", Location = "Dharan, Koshi", Type = "Retail", Orders = 0 }
        };
        
        SelectedCustomer = allCustomers.Find(c => c.Id == CustomerId);
    }

    // Dummy data from backend
    Fabrics = new List<FabricViewModel>
    {
        new FabricViewModel { Id = "FAB-001", Name = "Sunset Orange Cotton", ImageUrl = "/images/fabrics/FAB-001.jpg"},
        new FabricViewModel { Id = "FAB-002", Name = "Lime Green Linen", ImageUrl = "/images/fabrics/FAB-002.png"},
        new FabricViewModel { Id = "FAB-003", Name = "Royal Blue Silk", ImageUrl = "/images/fabrics/FAB-003.png"},
        new FabricViewModel { Id = "FAB-004", Name = "Sandy Brown Wool", ImageUrl = "/images/fabrics/FAB-004.png"},
        new FabricViewModel { Id = "FAB-005", Name = "Violet Velvet", ImageUrl = "/images/fabrics/FAB-005.png"} 
    };
  }
}
