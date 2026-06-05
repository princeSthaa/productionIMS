using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace kaam.Pages.CRM;

public class FabricPaletteViewModel
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Colors { get; set; } = new();
}

public class CreateOrder : CRMBasePageModel
{
  // 1. Catch the ID from the URL automatically
  [BindProperty(SupportsGet = true)]
  public required string CustomerId { get; set; }

  public List<FabricPaletteViewModel> FabricPalettes { get; set; } = new();

  public void OnGet()
  {
    LoadSidebarMenu();

    // Dummy data from backend
    FabricPalettes = new List<FabricPaletteViewModel>
    {
        new FabricPaletteViewModel { Id = "FC01", Name = "Elegant and Versatile Fabric Brand Palette", Colors = new List<string> { "#C9B2BB", "#6F4C4B", "#F2C94C", "#D9E4F5", "#4B3A2A" } },
        new FabricPaletteViewModel { Id = "FC02", Name = "Vibrant Summer Collection", Colors = new List<string> { "#FF5733", "#FFBD33", "#DBFF33", "#75FF33", "#33FF57" } },
        new FabricPaletteViewModel { Id = "FC03", Name = "Monochrome Essentials", Colors = new List<string> { "#FFFFFF", "#CCCCCC", "#999999", "#666666", "#333333" } },
        new FabricPaletteViewModel { Id = "FC04", Name = "Earthy Tones", Colors = new List<string> { "#8B4513", "#A0522D", "#CD853F", "#D2691E", "#F4A460" } }
    };
  }
}
