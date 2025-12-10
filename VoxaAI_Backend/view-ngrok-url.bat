@echo off
echo.
echo ========================================
echo   VoxaAI Ngrok URL Viewer
echo ========================================
echo.
echo Opening ngrok web interface...
echo.

start http://localhost:4040

echo.
echo Instructions:
echo 1. Copy the HTTPS URL for port 3000
echo 2. Open: VoxaAi\src\config\apiConfig.js
echo 3. Update NGROK_URL with your URL
echo 4. Set USE_NGROK = true
echo 5. Reload your Expo app
echo.
echo Example URL format:
echo   https://1234-56-78-90-12.ngrok-free.app
echo.
echo Press any key to close...
pause >nul
