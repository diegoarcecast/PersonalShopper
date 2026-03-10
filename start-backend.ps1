Write-Host "🚀 Iniciando Personal Shopper Backend..." -ForegroundColor Cyan

# Verificar SQL Server Express
$sqlService = Get-Service -Name "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue
if ($sqlService -and $sqlService.Status -ne "Running") {
    Write-Host "🔧 Iniciando SQL Server Express..." -ForegroundColor Yellow
    Start-Service "MSSQL`$SQLEXPRESS"
    Start-Sleep -Seconds 3
}

Set-Location "$PSScriptRoot\backend\PersonalShopper.Api"

Write-Host ""
Write-Host "✅ API en: http://localhost:5000" -ForegroundColor Green
Write-Host "📖 Swagger: http://localhost:5000/swagger" -ForegroundColor Green
Write-Host ""

dotnet run --urls "http://0.0.0.0:5000"
