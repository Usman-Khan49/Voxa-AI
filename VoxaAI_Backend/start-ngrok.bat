@echo off
echo.
echo Starting ngrok for VoxaAI Backend Gateway...
echo.
echo Note: Only the Gateway (port 3000) is exposed via ngrok
echo       The Gateway forwards requests to User service internally
echo.

ngrok http 3000
