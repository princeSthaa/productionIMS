using Microsoft.AspNetCore.Mvc.RazorPages;
using kaam.Pages.CRM;

namespace kaam.Pages.CRM.CustomerFilter;

public class IndexModel : CRMBasePageModel
{
    public void OnGet()
    {
        LoadSidebarMenu();
    }
}
