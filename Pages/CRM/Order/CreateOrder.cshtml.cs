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
        new FabricPaletteViewModel { Id = "FC01", Name = "Elegant and Versatile", Colors = new List<string> { "#C9B2BB", "#6F4C4B", "#F2C94C", "#D9E4F5", "#4B3A2A" } },
        new FabricPaletteViewModel { Id = "FC02", Name = "Vibrant Summer", Colors = new List<string> { "#FF5733", "#FFBD33", "#DBFF33", "#75FF33", "#33FF57" } },
        new FabricPaletteViewModel { Id = "FC03", Name = "Monochrome Essentials", Colors = new List<string> { "#FFFFFF", "#CCCCCC", "#999999", "#666666", "#333333" } },
        new FabricPaletteViewModel { Id = "FC04", Name = "Earthy Tones", Colors = new List<string> { "#8B4513", "#A0522D", "#CD853F", "#D2691E", "#F4A460" } },
        new FabricPaletteViewModel { Id = "FC05", Name = "Ocean Blues", Colors = new List<string> { "#0077BE", "#00A86B", "#4682B4", "#5F9EA0", "#B0E0E6" } },
        new FabricPaletteViewModel { Id = "FC06", Name = "Pastel Dreams", Colors = new List<string> { "#FFD1DC", "#FFB6C1", "#FFA07A", "#FF7F50", "#FF6347" } },
        new FabricPaletteViewModel { Id = "FC07", Name = "Neon Lights", Colors = new List<string> { "#39FF14", "#FF1493", "#00FFFF", "#FF00FF", "#FFFF00" } },
        new FabricPaletteViewModel { Id = "FC08", Name = "Forest Greens", Colors = new List<string> { "#228B22", "#006400", "#008000", "#2E8B57", "#3CB371" } },
        new FabricPaletteViewModel { Id = "FC09", Name = "Sunset Glow", Colors = new List<string> { "#FF4500", "#FF8C00", "#FFA500", "#FFD700", "#FFFFE0" } },
        new FabricPaletteViewModel { Id = "FC10", Name = "Berry Smoothies", Colors = new List<string> { "#8A2BE2", "#9400D3", "#9932CC", "#BA55D3", "#DDA0DD" } },
        new FabricPaletteViewModel { Id = "FC11", Name = "Coffee Shades", Colors = new List<string> { "#6F4E37", "#8B4513", "#A0522D", "#D2691E", "#CD853F" } },
        new FabricPaletteViewModel { Id = "FC12", Name = "Midnight City", Colors = new List<string> { "#191970", "#000080", "#4B0082", "#483D8B", "#2F4F4F" } }
    };
  }
}
