@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0.."

set "CMD=%~1"
set "SERVICE=%~2"
if "%CMD%"=="" set "CMD=help"
if "%SERVICE%"=="" set "SERVICE=frontend"

if /i "%CMD%"=="help" goto :help
if /i "%CMD%"=="up" goto :up
if /i "%CMD%"=="down" goto :down
if /i "%CMD%"=="status" goto :status
if /i "%CMD%"=="logs" goto :logs
if /i "%CMD%"=="restart" goto :restart
if /i "%CMD%"=="reset-frontend" goto :reset_frontend
if /i "%CMD%"=="verify-ui" goto :verify_ui
if /i "%CMD%"=="verify-admin" goto :verify_admin
if /i "%CMD%"=="migrate" goto :migrate
if /i "%CMD%"=="install" goto :install
if /i "%CMD%"=="shell" goto :shell
if /i "%CMD%"=="build-frontend" goto :build_frontend

echo Unknown command: %CMD%
goto :help

:help
echo.
echo Evoke dev commands (run from repo root)
echo.
echo   scripts\dev.cmd up                 Start all services (detached)
echo   scripts\dev.cmd down               Stop all services
echo   scripts\dev.cmd status             Show running containers
echo   scripts\dev.cmd logs [service]     Follow logs (default: frontend)
echo   scripts\dev.cmd restart [service]  Restart a service
echo   scripts\dev.cmd reset-frontend     Fix stale Next.js UI cache
echo   scripts\dev.cmd verify-ui          Check if new theme HTML is served
echo   scripts\dev.cmd verify-admin       Check admin sidebar layout in container
echo   scripts\dev.cmd migrate            Run migrations + seed
echo   scripts\dev.cmd install            composer + npm install in containers
echo   scripts\dev.cmd shell [service]    Open shell (frontend^|backend)
echo   scripts\dev.cmd build-frontend     Production build smoke test
echo.
echo Docs: docs\DEVELOPMENT.md
echo.
goto :eof

:up
docker compose --profile pgsql up -d --build
echo.
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3000/login
goto :eof

:down
docker compose down
goto :eof

:status
docker compose ps
goto :eof

:logs
docker compose logs -f %SERVICE%
goto :eof

:restart
docker compose restart %SERVICE%
goto :eof

:reset_frontend
echo Stopping frontend and clearing ALL Next.js caches...
docker compose stop frontend 2>nul
docker compose rm -f frontend 2>nul
if exist "frontend\.next" (
  rmdir /s /q "frontend\.next"
  echo Removed frontend\.next on host
)
if exist "frontend\node_modules\.cache" (
  rmdir /s /q "frontend\node_modules\.cache"
  echo Removed frontend\node_modules\.cache on host
)
docker compose up -d --force-recreate --no-build frontend
echo Waiting for dev server (up to 45s)...
set "READY=0"
for /L %%i in (1,1,9) do (
  if "!READY!"=="0" (
    timeout /t 5 /nobreak >nul
    curl -sf http://localhost:3000 >nul 2>&1
    if not errorlevel 1 set "READY=1"
  )
)
if "!READY!"=="0" echo WARN - Frontend not responding yet. Check: docker compose logs frontend
call "%~dp0dev.cmd" verify-ui
call "%~dp0dev.cmd" verify-admin
goto :eof

:verify_ui
echo Checking http://localhost:3000 ...
curl -sf http://localhost:3000 > "%TEMP%\evoke-ui-check.html" 2>nul
if errorlevel 1 (
  echo ERROR - Could not reach frontend. Run: docker compose up -d frontend
  goto :eof
)
findstr /i /c:"Premium Multi-Business" /c:"mesh-bg" /c:"font-display" "%TEMP%\evoke-ui-check.html" >nul
if errorlevel 1 (
  echo WARN - New UI markers not found. Run: scripts\dev.cmd reset-frontend
) else (
  echo OK - New UI detected
)
findstr /i /c:"bg-white text-zinc-900" "%TEMP%\evoke-ui-check.html" >nul
if not errorlevel 1 (
  echo WARN - Old layout still present
)
del "%TEMP%\evoke-ui-check.html" >nul 2>&1
goto :eof

:verify_admin
echo Checking admin layout source in frontend container...
docker compose exec -T frontend sh -c "cat /app/src/app/admin/layout.tsx" > "%TEMP%\evoke-admin-layout.txt" 2>nul
docker compose exec -T frontend sh -c "cat /app/src/app/globals.css" > "%TEMP%\evoke-admin-css.txt" 2>nul
if not exist "%TEMP%\evoke-admin-layout.txt" (
  echo ERROR - Could not read admin files in container. Is frontend running?
  goto :eof
)
set "FAILED=0"
findstr /i /c:"fixed-sidebar-v2" "%TEMP%\evoke-admin-layout.txt" >nul
if errorlevel 1 (echo FAIL - data-admin-layout marker & set /a FAILED+=1) else (echo OK - data-admin-layout marker)
findstr /i /c:"AdminScrollLock" "%TEMP%\evoke-admin-layout.txt" >nul
if errorlevel 1 (echo FAIL - AdminScrollLock & set /a FAILED+=1) else (echo OK - AdminScrollLock)
findstr /i /c:"admin-main-column" "%TEMP%\evoke-admin-layout.txt" >nul
if errorlevel 1 (echo FAIL - admin-main-column & set /a FAILED+=1) else (echo OK - admin-main-column)
findstr /i /c:".admin-sidebar" "%TEMP%\evoke-admin-css.txt" >nul
if errorlevel 1 (set "SIDEBAR=0") else (set "SIDEBAR=1")
findstr /i /c:"position: fixed" "%TEMP%\evoke-admin-css.txt" >nul
if errorlevel 1 (set "FIXED=0") else (set "FIXED=1")
if "!SIDEBAR!"=="1" if "!FIXED!"=="1" (echo OK - sidebar position:fixed in CSS) else (echo FAIL - sidebar position:fixed in CSS & set /a FAILED+=1)
findstr /i /c:"html.admin-route" "%TEMP%\evoke-admin-css.txt" >nul
if errorlevel 1 (echo FAIL - body scroll lock CSS & set /a FAILED+=1) else (echo OK - body scroll lock CSS)
del "%TEMP%\evoke-admin-layout.txt" "%TEMP%\evoke-admin-css.txt" >nul 2>&1
if "!FAILED!"=="0" (
  echo.
  echo Admin sidebar fix is in the container. Hard refresh: Ctrl+Shift+R at http://localhost:3000/admin
) else (
  echo.
  echo Admin fix NOT fully deployed. Run: scripts\dev.cmd reset-frontend
)
goto :eof

:migrate
docker compose exec backend php artisan migrate --seed
goto :eof

:install
docker compose exec backend composer install
docker compose exec frontend npm install
goto :eof

:shell
if /i "%SERVICE%"=="backend" (
  docker compose exec backend bash
) else (
  docker compose exec frontend sh
)
goto :eof

:build_frontend
docker compose exec frontend npm run build
goto :eof
