@echo off
title Bella Roma Print Service
cd /d "%~dp0"
echo ==================================================
echo   BELLA ROMA - IN-HOUSE PRINT SERVICE (USB)
echo ==================================================
echo.
if exist "dist\bella-print-service.exe" (
    echo Pornire executabil compilata...
    start "" "dist\bella-print-service.exe"
) else if exist "bella-print-service.exe" (
    echo Pornire executabil...
    start "" "bella-print-service.exe"
) else (
    echo Pornire prin Node.js...
    node index.js
)
