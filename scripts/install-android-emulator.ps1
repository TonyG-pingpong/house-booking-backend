# Install Android Studio and prepare environment for Android emulator (Windows).
# Run from project root. Optionally run PowerShell as Administrator for system-wide install.
# Usage: .\scripts\install-android-emulator.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Android Studio install for emulator  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check/install winget
if (!(Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "winget not found. Install App Installer / Windows Package Manager from Microsoft Store, or run this on Windows 10/11 with latest updates." -ForegroundColor Yellow
    exit 1
}

# 2. Install Android Studio
Write-Host "Installing Android Studio (this may take a few minutes)..." -ForegroundColor Green
$result = winget install --id Google.AndroidStudio --accept-package-agreements --accept-source-agreements 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "winget install failed. Try running: winget install Google.AndroidStudio" -ForegroundColor Yellow
    exit 1
}
Write-Host "Android Studio install completed." -ForegroundColor Green

# 3. Set ANDROID_HOME for current user (default SDK path)
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
$env:ANDROID_HOME = $sdkPath
Write-Host "Set ANDROID_HOME = $sdkPath (User environment)" -ForegroundColor Green

# 4. Create AVD directory hint (user must create AVD in Android Studio)
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your terminal (or log out and back in) so ANDROID_HOME is set." -ForegroundColor White
Write-Host "  2. Open Android Studio." -ForegroundColor White
Write-Host "  3. More Actions -> Virtual Device Manager (or Tools -> Device Manager)." -ForegroundColor White
Write-Host "  4. Create Device -> pick a phone (e.g. Pixel 6) -> Next." -ForegroundColor White
Write-Host "  5. Download a system image if needed (e.g. API 34) -> Next -> Finish." -ForegroundColor White
Write-Host ""
Write-Host "Then run the app on the emulator with:" -ForegroundColor Cyan
Write-Host "  scripts\run-android-emulator.bat" -ForegroundColor White
Write-Host ""
