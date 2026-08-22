@echo off
title Bella Roma Print Service
cd /d "%~dp0"
echo ==================================================
echo   BELLA ROMA - IN-HOUSE PRINT SERVICE (USB)
echo ==================================================
echo.
if exist "bella-print-service.exe" (
    echo Pornire bella-print-service.exe...
    bella-print-service.exe
) else if exist "dist\bella-print-service.exe" (
    echo Pornire dist\bella-print-service.exe...
    dist\bella-print-service.exe
) else if exist "bundle.js" (
    echo Pornire prin Node.js (bundle.js)...
    node bundle.js
) else (
    echo Pornire prin Node.js (index.js)...
    node index.js
)
echo.
echo ==================================================
echo   Serviciul s-a oprit.
echo ==================================================
pause
