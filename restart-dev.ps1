# 🔄 Restart Development Server
Write-Host "`n🔄 Cleaning Next.js cache and restarting server...`n" -ForegroundColor Cyan

# Stop any running dev server
Write-Host "1️⃣  Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*flow-command*" } | Stop-Process -Force

# Remove .next cache
Write-Host "2️⃣  Removing .next cache directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clearremove" -ForegroundColor Gray
}

# Start dev server
Write-Host "3️⃣  Starting development server..." -ForegroundColor Yellow
Write-Host "`n" -ForegroundColor White
npm run dev
