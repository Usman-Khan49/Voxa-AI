@echo off
REM Run all microservices in separate CMD windows

set BASEDIR=%~dp0

start "Gateway Service" cmd /k "cd /d %BASEDIR%Microservices\Gateway && npm install && npm run start"
start "User Service" cmd /k "cd /d %BASEDIR%Microservices\User && npm install && npm run start"
start "AI Service" cmd /k "cd /d %BASEDIR%Microservices\AI && pip install -r requirements.txt && python server.py"