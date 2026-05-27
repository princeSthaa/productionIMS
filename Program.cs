var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();

var app = builder.Build();

// Enable serving static files from wwwroot
app.UseStaticFiles();

// Map Razor Pages
app.MapRazorPages();

app.Run();
