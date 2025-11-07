using Microsoft.Playwright;

Console.WriteLine("Installing Playwright Chromium browser...");

var exitCode = Microsoft.Playwright.Program.Main(new[] { "install", "chromium", "--with-deps" });

if (exitCode == 0)
{
    Console.WriteLine("Playwright Chromium installed successfully!");
}
else
{
    Console.WriteLine($"Playwright installation failed with exit code: {exitCode}");
    Environment.Exit(exitCode);
}
