@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0.."

set "CMD=%~1"
if "%CMD%"=="" set "CMD=help"

set "COMPOSE_FILES=-f docker-compose.yml"
set "COMPOSE_MODE=dev"
set "STACK=core"
set "SERVICE=frontend"
set "PROFILES=--profile pgsql"
set "DB_CONNECTION=pgsql"
set "DB_HOST=postgres"
set "DB_PORT=5432"

if /i "%CMD%"=="prod" goto :prod_entry

if /i "%CMD%"=="help" goto :help
if /i "%CMD%"=="stacks" goto :stacks
if /i "%CMD%"=="init" goto :init
if /i "%CMD%"=="up" goto :up
if /i "%CMD%"=="down" goto :down
if /i "%CMD%"=="restart" goto :restart
if /i "%CMD%"=="status" goto :status
if /i "%CMD%"=="logs" goto :logs
if /i "%CMD%"=="install" goto :install
if /i "%CMD%"=="migrate" goto :migrate
if /i "%CMD%"=="shell" goto :shell
if /i "%CMD%"=="health" goto :health
if /i "%CMD%"=="smoke" goto :smoke
if /i "%CMD%"=="build" goto :build

echo Unknown command: %CMD%
goto :help

:prod_entry
set "COMPOSE_FILES=-f docker-compose.yml -f docker-compose.prod.yml"
set "COMPOSE_MODE=prod"
set "CMD=%~2"
if "%CMD%"=="" goto :prod_help
if /i "%CMD%"=="help" goto :prod_help
if /i "%CMD%"=="up" (
  set "ARGPOS=3"
  goto :up
)
if /i "%CMD%"=="down" goto :down
if /i "%CMD%"=="build" (
  set "ARGPOS=3"
  goto :build
)
if /i "%CMD%"=="migrate" (
  set "ARGPOS=3"
  goto :migrate
)
if /i "%CMD%"=="health" goto :health
goto :prod_help

:prod_help
echo.
echo Prod commands:
echo   scripts\run.cmd prod up [stack] [--migrate] [--seed]
echo   scripts\run.cmd prod down [--volumes]
echo   scripts\run.cmd prod build [stack]
echo   scripts\run.cmd prod migrate [stack] [--seed] [--fresh]
echo   scripts\run.cmd prod health
goto :eof

:help
echo.
echo Evoke run — CMD (see RUN.md)
echo.
echo   scripts\run.cmd init
echo   scripts\run.cmd up [stack] [--migrate] [--seed]
echo   scripts\run.cmd down [--volumes]
echo   scripts\run.cmd status ^| logs [svc] ^| restart [svc]
echo   scripts\run.cmd migrate [stack] [--seed] [--fresh]
echo   scripts\run.cmd install ^| shell [svc] ^| health ^| smoke ^| build [stack]
echo   scripts\run.cmd stacks
echo   scripts\run.cmd prod up [stack] [--migrate]
echo.
echo Stacks: core ^| web ^| mysql ^| workers ^| ai ^| full
echo.
echo PowerShell: .\scripts\run.ps1 ...
echo WSL:        ./scripts/run.sh ...
echo.
goto :eof

:stacks
echo.
echo Stacks:
echo   core     frontend, backend, postgres, redis
echo   web      core + nginx (:8080)
echo   mysql    frontend, backend, mysql, redis
echo   workers  core + queue-worker + scheduler
echo   ai       core + ai-service + ollama
echo   full     nginx + workers + ai + postgres
echo.
goto :eof

:detect_stack
set "STACK=core"
if not "%~1"=="" (
  if /i "%~1"=="core" set "STACK=core"
  if /i "%~1"=="web" set "STACK=web"
  if /i "%~1"=="mysql" set "STACK=mysql"
  if /i "%~1"=="workers" set "STACK=workers"
  if /i "%~1"=="ai" set "STACK=ai"
  if /i "%~1"=="full" set "STACK=full"
)
exit /b 0

:apply_stack_profiles
set "PROFILES=--profile pgsql"
set "DB_CONNECTION=pgsql"
set "DB_HOST=postgres"
set "DB_PORT=5432"
if /i "!STACK!"=="web" set "PROFILES=--profile pgsql --profile proxy"
if /i "!STACK!"=="mysql" (
  set "PROFILES=--profile mysql"
  set "DB_CONNECTION=mysql"
  set "DB_HOST=mysql"
  set "DB_PORT=3306"
)
if /i "!STACK!"=="workers" set "PROFILES=--profile pgsql --profile workers"
if /i "!STACK!"=="ai" set "PROFILES=--profile pgsql --profile ai"
if /i "!STACK!"=="full" set "PROFILES=--profile full"
exit /b 0

:parse_flags
set "FLAG_MIGRATE=0"
set "FLAG_SEED=0"
set "FLAG_FRESH=0"
set "FLAG_BUILD=1"
set "FLAG_PULL=0"
set "FLAG_FG=0"
set "FLAG_VOLUMES=0"
set "FLAG_FORCE=0"
echo %* | findstr /i /c:"--migrate" >nul && set "FLAG_MIGRATE=1"
echo %* | findstr /i /c:"--seed" >nul && (set "FLAG_MIGRATE=1" & set "FLAG_SEED=1")
echo %* | findstr /i /c:"--fresh" >nul && (set "FLAG_MIGRATE=1" & set "FLAG_SEED=1" & set "FLAG_FRESH=1")
echo %* | findstr /i /c:"--no-build" >nul && set "FLAG_BUILD=0"
echo %* | findstr /i /c:"--watch" >nul && set "FLAG_BUILD=0"
echo %* | findstr /i /c:"--pull" >nul && set "FLAG_PULL=1"
echo %* | findstr /i /c:"--foreground" >nul && set "FLAG_FG=1"
echo %* | findstr /i /c:" -f " >nul && set "FLAG_FG=1"
echo %* | findstr /i /c:"--volumes" >nul && set "FLAG_VOLUMES=1"
echo %* | findstr /i /c:"--force" >nul && set "FLAG_FORCE=1"
exit /b 0

:print_urls
echo.
echo URLs:
echo   Frontend:  http://localhost:3000
echo   Admin:     http://localhost:3000/login
echo   API:       http://localhost:8000/api/v1
if /i "!STACK!"=="web" echo   Proxy:     http://localhost:8080
if /i "!STACK!"=="full" echo   Proxy:     http://localhost:8080
if /i "!STACK!"=="ai" echo   AI:        http://localhost:8001
if /i "!STACK!"=="full" echo   AI:        http://localhost:8001
echo.
echo Login: admin@evoke.com / password
exit /b 0

:init
call :parse_flags %*
echo Initializing env files...
if exist ".env" (
  if "!FLAG_FORCE!"=="0" (echo   keep  .env) else (copy /y ".env.example" ".env" >nul & echo   create .env)
) else (
  if exist ".env.example" (copy /y ".env.example" ".env" >nul & echo   create .env) else (echo   skip  .env)
)
if exist "backend\.env" (
  if "!FLAG_FORCE!"=="0" (echo   keep  backend\.env) else (copy /y "backend\.env.example" "backend\.env" >nul & echo   create backend\.env)
) else (
  if exist "backend\.env.example" (copy /y "backend\.env.example" "backend\.env" >nul & echo   create backend\.env) else (echo   skip  backend\.env)
)
if exist "frontend\.env.local" (
  if "!FLAG_FORCE!"=="0" (echo   keep  frontend\.env.local) else (copy /y "frontend\.env.example" "frontend\.env.local" >nul & echo   create frontend\.env.local)
) else (
  if exist "frontend\.env.example" (copy /y "frontend\.env.example" "frontend\.env.local" >nul & echo   create frontend\.env.local) else (echo   skip  frontend\.env.local)
)
echo.
echo Next: scripts\run.cmd up core --migrate --seed
goto :eof

:up
if not defined ARGPOS set "ARGPOS=2"
call :detect_stack %~2
if "%ARGPOS%"=="3" call :detect_stack %~3
call :parse_flags %*
call :apply_stack_profiles
echo Stack: !STACK! (!COMPOSE_MODE! mode)
echo Profiles: !PROFILES!
if "!FLAG_PULL!"=="1" docker compose !COMPOSE_FILES! !PROFILES! pull --ignore-buildable 2>nul
set "UP_EXTRA=-d"
if "!FLAG_FG!"=="1" set "UP_EXTRA="
if "!FLAG_BUILD!"=="1" (
  docker compose !COMPOSE_FILES! !PROFILES! up !UP_EXTRA! --build
) else (
  docker compose !COMPOSE_FILES! !PROFILES! up !UP_EXTRA!
)
if errorlevel 1 exit /b 1
if "!FLAG_MIGRATE!"=="1" (
  echo.
  echo Waiting for backend...
  timeout /t 5 /nobreak >nul
  call :migrate_internal
)
call :print_urls
set "ARGPOS="
goto :eof

:build
if not defined ARGPOS set "ARGPOS=2"
call :detect_stack %~2
if "%ARGPOS%"=="3" call :detect_stack %~3
call :apply_stack_profiles
docker compose !COMPOSE_FILES! !PROFILES! build
set "ARGPOS="
goto :eof

:down
call :parse_flags %*
if "!FLAG_VOLUMES!"=="1" (
  docker compose -f docker-compose.yml --profile full --profile mysql down -v --remove-orphans
) else (
  docker compose -f docker-compose.yml --profile full --profile mysql down --remove-orphans
)
goto :eof

:restart
set "SERVICE=%~2"
if "%SERVICE%"=="" set "SERVICE=frontend"
call :apply_stack_profiles
docker compose !COMPOSE_FILES! !PROFILES! restart !SERVICE!
goto :eof

:status
docker compose -f docker-compose.yml ps -a
goto :eof

:logs
set "SERVICE=%~2"
if "%SERVICE%"=="" set "SERVICE=frontend"
call :apply_stack_profiles
docker compose !COMPOSE_FILES! !PROFILES! logs -f !SERVICE!
goto :eof

:install
call :apply_stack_profiles
docker compose !COMPOSE_FILES! !PROFILES! exec -T backend composer install --no-interaction
docker compose !COMPOSE_FILES! !PROFILES! exec -T frontend npm install
goto :eof

:migrate
if not defined ARGPOS set "ARGPOS=2"
call :detect_stack %~2
if "%ARGPOS%"=="3" call :detect_stack %~3
call :parse_flags %*
call :apply_stack_profiles
call :migrate_internal
set "ARGPOS="
goto :eof

:migrate_internal
if "!FLAG_FRESH!"=="1" (
  docker compose !COMPOSE_FILES! !PROFILES! exec -T backend php artisan migrate:fresh --seed --force
) else if "!FLAG_SEED!"=="1" (
  docker compose !COMPOSE_FILES! !PROFILES! exec -T backend php artisan migrate --seed --force
) else (
  docker compose !COMPOSE_FILES! !PROFILES! exec -T backend php artisan migrate --force
)
exit /b 0

:shell
set "SERVICE=%~2"
if "%SERVICE%"=="" set "SERVICE=frontend"
call :apply_stack_profiles
if /i "!SERVICE!"=="backend" (
  docker compose !COMPOSE_FILES! !PROFILES! exec backend bash
) else (
  docker compose !COMPOSE_FILES! !PROFILES! exec frontend sh
)
goto :eof

:health
set "OK=1"
curl -sf --max-time 10 http://localhost:3000 >nul 2>&1
if errorlevel 1 (echo FAIL Frontend — http://localhost:3000 & set "OK=0") else (echo OK   Frontend — http://localhost:3000)
curl -sf --max-time 10 http://localhost:8000/api/v1/health >nul 2>&1
if errorlevel 1 (echo FAIL API — http://localhost:8000/api/v1/health & set "OK=0") else (echo OK   API — http://localhost:8000/api/v1/health)
curl -sf --max-time 5 http://localhost:8080 >nul 2>&1
if not errorlevel 1 echo OK   Nginx proxy — http://localhost:8080
if "!OK!"=="0" exit /b 1
goto :eof

:smoke
call :health
echo.
curl -sf --max-time 15 http://localhost:3000 > "%TEMP%\evoke-run-smoke.html" 2>nul
if errorlevel 1 (
  echo WARN Could not fetch homepage
) else (
  findstr /i /c:"Evoke" /c:"mesh-bg" /c:"font-display" "%TEMP%\evoke-run-smoke.html" >nul
  if errorlevel 1 (echo WARN Homepage missing expected markers) else (echo OK   Homepage HTML looks sane)
)
del "%TEMP%\evoke-run-smoke.html" >nul 2>&1
call :apply_stack_profiles
docker compose !COMPOSE_FILES! !PROFILES! exec -T backend php artisan migrate:status >nul 2>&1
if errorlevel 1 (
  echo WARN migrate:status failed
) else (
  echo OK   Database reachable from backend
)
goto :eof
