@echo off
chcp 65001 >nul
title Instalare Certificat QZ Tray - Bella Roma Pizzerie
echo.
echo ============================================
echo   BELLA ROMA - Configurare Imprimanta QZ Tray
echo ============================================
echo.

set "QZ_PATH=%APPDATA%\QZ Tray"
set "SSL_PATH=%QZ_PATH%\sslcert"

echo [1/3] Se creeaza folderele necesare...
if not exist "%QZ_PATH%" mkdir "%QZ_PATH%"
if not exist "%SSL_PATH%" mkdir "%SSL_PATH%"
echo       OK - Foldere create

echo [2/3] Se instaleaza certificatul digital...
(
echo -----BEGIN CERTIFICATE-----
echo MIIC/DCCAeQCCQCa8tjrVFTdTzANBgkqhkiG9w0BAQsFADBAMRwwGgYDVQQDDBNC
echo ZWxsYSBSb21hIFBpenplcmllMRMwEQYDVQQKDApCZWxsYSBSb21hMQswCQYDVQQG
echo EwJSTzAeFw0yNjA4MTcwODE5NTNaFw0zNjA4MTQwODE5NTNaMEAxHDAaBgNVBAMM
echo E0JlbGxhIFJvbWEgUGl6emVyaWUxEzARBgNVBAoMCkJlbGxhIFJvbWExCzAJBgNV
echo BAYTAlJPMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyIlOlsiH0rt8
echo +x5TodLsyrlhKhDKVKqtRIbxKgr+U2AdNaT7fRAzDCaYvLYNgNxyjoBMBRt97UTI
echo IUY35oHBVMq4AwVwJQEe81MxoLJpV8PerYsSUuoaV0hfnGQjTjHgSfLpZvABZ6XF
echo D6VwCvg2u9JRsBDptdNaR1hIBmIwM7qNRill2LnAbqdVqOFIzd/sky1qywD+2/bi
echo 54rBf0ml8SNgw/9V0hvSXeGGYgV/u2KN+HAWNt2/sKdwdurdchak7O5YqgNvqPx0
echo 1JvkO/NhIGLd11LrbPbineNiXQuHwKQ1QVWQNcNHgIQ5JIFQuXNUMH8LZFs4KGZL
echo nRL/7FpLOwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC7P039OQg3Zi/aZD8XHBkv
echo 1SfuDeG3EgW5lqGdLib6cX1Ft/0XSIXYPIm/uMZrhn6owtEu9XP1nZGlt9u5ByMD
echo GlsVdZX2EqBAhic4jQZa3N3rivpIHWTJfqMOE4eYYPrEXz3a4nmW5ZfW9Sp480qd
echo gzPZLzVVwF7TtbmTyQ9gRE0c5mN/hHPvNTrCeGdqt2OjHfSVEVpvgwzvYI6yUftc
echo V0+zyU4bzK51xmlBsofb1NfAjkLFj3oMNjCdMYTe36TC1sT0wbOYC262artO7dbj
echo jA7Y2ztoFknFP/eGkUeXClaqcDqp1NHX3WWvZ5Eee3/qMGmmdiaqrQYwu6h2m7EF
echo -----END CERTIFICATE-----
) > "%SSL_PATH%\digital-certificate.txt"
echo       OK - Certificat instalat cu succes!

echo [3/3] Se reporneste QZ Tray...
taskkill /f /im "qz-tray.exe" >nul 2>&1
timeout /t 3 /nobreak >nul
if exist "%ProgramFiles%\QZ Tray\qz-tray.exe" (
    start "" "%ProgramFiles%\QZ Tray\qz-tray.exe"
) else if exist "%ProgramFiles(x86)%\QZ Tray\qz-tray.exe" (
    start "" "%ProgramFiles(x86)%\QZ Tray\qz-tray.exe"
) else if exist "%LOCALAPPDATA%\Programs\QZ Tray\qz-tray.exe" (
    start "" "%LOCALAPPDATA%\Programs\QZ Tray\qz-tray.exe"
) else (
    echo       ! Porneste QZ Tray manual din Start Menu
)
echo       OK - QZ Tray repornit

echo.
echo ============================================
echo   INSTALARE COMPLETA!
echo ============================================
echo.
echo Deschide browserul si acceseaza:
echo   https://proiect-pizzeria.vercel.app/receptie.html
echo.
echo Imprimanta va printa AUTOMAT fara niciun popup!
echo.
pause
