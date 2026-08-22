@echo off
title Test Printare Bella Roma
cd /d "%~dp0"
echo ==================================================
echo   TESTARE RAPIDA IMPRIMANTA POS (USB)
echo ==================================================
echo.
if exist "bella-print-service.exe" (
    echo Rulare test prin bella-print-service.exe...
    bella-print-service.exe --test
) else if exist "dist\bella-print-service.exe" (
    echo Rulare test prin dist\bella-print-service.exe...
    dist\bella-print-service.exe --test
) else if exist "bundle.js" (
    echo Rulare test prin Node.js (bundle.js)...
    node bundle.js --test
) else (
    echo Rulare test prin Node.js (test-print.js)...
    node test-print.js
)
echo.
pause
