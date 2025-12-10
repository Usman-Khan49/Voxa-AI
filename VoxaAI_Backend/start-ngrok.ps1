# VoxaAI Backend with ngrok
# This script starts ngrok tunnel for the Gateway service
# The Gateway forwards requests to the User service internally

Write-Host "Starting ngrok tunnel for VoxaAI Backend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: We only expose the Gateway (port 3000) via ngrok." -ForegroundColor Yellow
Write-Host "      The Gateway forwards requests to User service internally." -ForegroundColor Yellow
Write-Host ""

# Start ngrok for Gateway (port 3000) only
Write-Host "Starting ngrok tunnel for Gateway (port 3000)..." -ForegroundColor Green
ngrok http 3000

# Note: ngrok http 3000 runs in the foreground and will block
# Press Ctrl+C to stop the tunnel
