using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace kaam.Pages.CRM;

public class CreateCustomer : CRMBasePageModel
{
  [BindProperty]
  public InputModel Input { get; set; } = new();

  public class InputModel
  {
      [Required(ErrorMessage = "Full Name is required.")]
      [StringLength(100, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 100 characters.")]
      public string CustomerName { get; set; } = string.Empty;

      [StringLength(100)]
      public string? CompanyName { get; set; }

      [EmailAddress(ErrorMessage = "Invalid Email Address.")]
      public string? Email { get; set; }

      [Required(ErrorMessage = "Phone Number is required.")]
      [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone Number must be exactly 10 digits.")]
      public string Phone { get; set; } = string.Empty;

      [RegularExpression(@"^\d{9}$", ErrorMessage = "PAN / VAT Number must be exactly 9 digits.")]
      public string? PanVatNo { get; set; }

      public string? CustomerType { get; set; }

      [StringLength(500)]
      public string? Address { get; set; }
  }

  public void OnGet()
  {
    LoadSidebarMenu();
  }

  public IActionResult OnPost()
  {
      if (!ModelState.IsValid)
      {
          LoadSidebarMenu();
          return Page();
      }

      // TODO: Process the valid input here (e.g., save to DB)
      return RedirectToPage("/CRM/Index");
  }
}
