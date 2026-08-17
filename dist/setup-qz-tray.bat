@echo off
chcp 65001 >nul
title Instalare Certificat QZ Tray - Bella Roma Pizzerie
echo.
echo ============================================
echo   BELLA ROMA - Configurare Imprimanta QZ Tray
echo ============================================
echo.

:: Calea QZ Tray pe Windows
set "QZ_PATH=%APPDATA%\QZ Tray"
set "SSL_PATH=%QZ_PATH%\sslcert"

echo [1/4] Se verifica QZ Tray...
if not exist "%QZ_PATH%" (
    echo.
    echo EROARE: QZ Tray nu este instalat!
    echo Descarca QZ Tray de pe: https://qz.io/download/
    echo Instaleaza-l si ruleaza din nou acest script.
    echo.
    pause
    exit /b 1
)
echo       OK - QZ Tray gasit la: %QZ_PATH%

echo [2/4] Se creeaza folderul certificat...
if not exist "%SSL_PATH%" mkdir "%SSL_PATH%"
echo       OK - Folder creat: %SSL_PATH%

echo [3/4] Se instaleaza certificatul digital...
(
echo -----BEGIN CERTIFICATE-----
echo MIIEpAIBAAKCAQEAyIlOlsiH0rt8+x5TodLsyrlhKhDKVKqtRIbxKgr+U2AdNaT7
echo fRAzDCaYvLYNgNxyjoBMBRt97UTIIUY35oHBVMq4AwVwJQEe81MxoLJpV8PerYsS
echo UuoaV0hfnGQjTjHgSfLpZvABZ6XFD6VwCvg2u9JRsBDptdNaR1hIBmIwM7qNRill
echo 2LnAbqdVqOFIzd/sky1qywD+2/bi54rBf0ml8SNgw/9V0hvSXeGGYgV/u2KN+HAW
echo Nt2/sKdwdurdchak7O5YqgNvqPx01JvkO/NhIGLd11LrbPbineNiXQuHwKQ1QVWQ
echo NcNHgIQ5JIFQuXNUMH8LZFs4KGZLnRL/7FpLOwIDAQABAoIBAQCkxOzlx26SH6rZ
echo Slm9JOmayCalwZX9ax9ipt2Qhefh6Z8WbLCWWbEX0r68j3kY4AjgPVo4+BXH1jP5
echo 4xAbPZH0cXwwP0+dmAYuN7UXLICRtEZKoXI03lU2Uij8/upjXWfEWuqbwafl2bbI
echo 3E3rNXcDbBPiboMY+se6xzamyBaC6NdQRUB3/w6Pd90VCIQOVhfIfLXxArPhDYGF
echo d/pTRk/B4v/VlbIaZSXE0cqtPydUXSMMZnV8xsa9kHkBJ91vvErcVJpGlsDVbVnJ
echo u+5EhicPh0pNthq0hgdvtE83PcOP70LUYQNxjurq2AOplnJ5btouUW/cqotE6QPS
echo P1UWk6LBAoGBAPeFQA3ywSWl9IEUnVN2krtEL+fJaLHO4fM4aNdIfxBentI7zkui
echo 7fhMM7gt+xJIYOcWamKS4zfwgCCWq0xX+M9ZplrG/aof99M9r0H4lgH2q7YLdr6b
echo 88Yf/RNWr9I8+LaHM/zivdSxa3lxFF3+nyoRhJjRIv3XBF+kM54QcQ6HAoGBAM9o
echo AbgPDIpv0q4uPAEZQnAvDyqg373gieAdTpEMnBfyzeBM1XU1a4phb6l3zoq3yXEi
echo jpyKBRYzlmAIQT84Ck+exQ0CPiOloKVvaz7hfB+VNFnwJD7en91KsH9FlVqM5gO/
echo x6DaEK9ZXuOFNJodD8h3PFRPUb+MzsTIXZQvxTatAoGBALVDlgcg8aWahRZKfHR0
echo 7zvI0bRS4SLluL6fXtfZtYPNZ03aklb9uHwPggitU6Kt8pkI51vM6i07KPm0nTnJ
echo auKeap8r/vQpeRnvoHsVivVhKZqlho5MMxeysWkKILQ8Bn/VP5NAkXhDfctvrlSv
echo dOwf7BTlg1SVtBQ+cbadn83dAoGADmvv+qlpONMPtjbWy0jDWuOazV8ET8KmM6Q2
echo C1XyIKQsdpVBHnZJdQTTa9g9z116L1i0y+O4+NM7eI/6YXf3F5Q1pXLreTUSF47I
echo yUWKiPOqATr2ejympw+DeEYRXYuAjvAt5FxlXpv7QhzIDJNKvqiz1DTzvTsAQaSh
echo BSXRM70CgYBWWaBpuCCxsuPZVrcV6BT5HjRuXPQ/VUPa7m7MJfljpmiZKn85wAR2
echo e102YBQ+sbWSIXaRcbVgQlUTarpeBepCZ8CemuwU6v52qFR1vFqzrT8Us9j5il9u
echo cmislyBkYbexYBYwSSgtxKvsqYU0WbuHsvfrcCDvi/itEXvytisfWA==
echo -----END CERTIFICATE-----
) > "%SSL_PATH%\digital-certificate.txt"
echo       OK - Certificat instalat

echo [4/4] Se reporneste QZ Tray...
taskkill /f /im "qz-tray.exe" >nul 2>&1
timeout /t 2 /nobreak >nul
start "" "%ProgramFiles%\QZ Tray\qz-tray.exe" 2>nul
if errorlevel 1 (
    start "" "%ProgramFiles(x86)%\QZ Tray\qz-tray.exe" 2>nul
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
echo Imprimanta va printa automat fara nicio fereastra!
echo.
pause
