@echo off
title Barber Studio - Admin Panel
cd /d "%~dp0"

echo ========================================
echo      BARBER STUDIO - PANEL ADMIN
echo ========================================
echo.
echo  Abriendo navegador en http://localhost:3001/admin
echo  Presiona Ctrl+C para detener el servidor
echo.
start http://localhost:3001/admin
npx next dev -p 3001

echo.
echo  Servidor detenido.
pause
