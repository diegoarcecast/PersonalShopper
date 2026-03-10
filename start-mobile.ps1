Write-Host "📱 Iniciando Personal Shopper Mobile (Expo)..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\mobile"

# Leer la URL actual del .env
$envFile = "$PSScriptRoot\mobile\.env"
$currentUrl = (Get-Content $envFile | Where-Object { $_ -match "EXPO_PUBLIC_API_BASE_URL" }) -replace ".*=", ""
Write-Host ""
Write-Host "🌐 API URL actual: $currentUrl" -ForegroundColor Yellow
Write-Host ""

# Preguntar si el usuario quiere cambiar la URL (útil para Tailscale)
$change = Read-Host "¿Cambiar la URL de la API? (Enter para mantener la actual, o escribe la nueva URL)"
if ($change -ne "") {
    (Get-Content $envFile) -replace "EXPO_PUBLIC_API_BASE_URL=.*", "EXPO_PUBLIC_API_BASE_URL=$change" | Set-Content $envFile
    Write-Host "✅ URL actualizada a: $change" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
npm install --silent

Write-Host ""
Write-Host "🚀 Iniciando Expo. Escanea el QR con Expo Go en tu celular." -ForegroundColor Green
Write-Host "   (Asegúrate de que el celular esté en la misma red o usando Tailscale)" -ForegroundColor DarkGray
Write-Host ""

npx expo start
