@echo off
title Diagnostic Bella Roma Print Service
cd /d "%~dp0"
echo ==================================================
echo   DIAGNOSTIC BELLA ROMA PRINT SERVICE
echo   (Aceasta fereastra NU se va inchide niciodata)
echo ==================================================
echo.
if exist "bella-print-service.exe" (
    echo Executabil gasit. Lansare...
    bella-print-service.exe
) else if exist "dist\bella-print-service.exe" (
    echo Executabil gasit in dist. Lansare...
    dist\bella-print-service.exe
) else (
    echo Executabilul nu a fost gasit in acest folder!
    dir
)
echo.
echo ==================================================
echo Procesul s-a incheiat. Detaliile raman afisate mai sus.
echo ==================================================
echo.
cmd /k
