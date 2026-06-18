# Evoke development helpers - PowerShell
# Usage: .\scripts\dev.ps1 <command> [service]
# Example: .\scripts\dev.ps1 reset-frontend

param(
    [Parameter(Position = 0)]
    [string]$Command = "help",

    [Parameter(Position = 1)]
    [string]$Service = "frontend"
)

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Show-Help {
    Write-Host ""
    Write-Host "Evoke dev commands (run from repo root)"
    Write-Host ""
    Write-Host "  .\scripts\dev.ps1 up                 Start all services (detached)"
    Write-Host "  .\scripts\dev.ps1 down               Stop all services"
    Write-Host "  .\scripts\dev.ps1 status             Show running containers"
    Write-Host "  .\scripts\dev.ps1 logs [service]     Follow logs (default: frontend)"
    Write-Host "  .\scripts\dev.ps1 restart [service]  Restart a service"
    Write-Host "  .\scripts\dev.ps1 reset-frontend     Fix stale Next.js UI cache"
    Write-Host "  .\scripts\dev.ps1 verify-ui          Check if new theme HTML is served"
    Write-Host "  .\scripts\dev.ps1 verify-admin       Check admin sidebar layout markers in source"
    Write-Host "  .\scripts\dev.ps1 migrate            Run migrations + seed"
    Write-Host "  .\scripts\dev.ps1 install            composer + npm install in containers"
    Write-Host "  .\scripts\dev.ps1 shell [service]    Open shell (frontend|backend)"
    Write-Host "  .\scripts\dev.ps1 build-frontend     Production build smoke test"
    Write-Host ""
    Write-Host "Docs: docs/DEVELOPMENT.md"
    Write-Host ""
}

switch ($Command.ToLower()) {
    "help" { Show-Help }
    "up" {
        docker compose --profile pgsql up -d --build
        Write-Host ""
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
        Write-Host "Admin:    http://localhost:3000/login" -ForegroundColor Green
    }
    "down" { docker compose down }
    "status" { docker compose ps }
    "logs" { docker compose logs -f $Service }
    "restart" { docker compose restart $Service }
    "reset-frontend" {
        Write-Host "Stopping frontend and clearing ALL Next.js caches..." -ForegroundColor Yellow
        docker compose stop frontend 2>$null
        docker compose rm -f frontend 2>$null
        if (Test-Path "frontend\.next") {
            Remove-Item -Recurse -Force "frontend\.next"
            Write-Host "Removed frontend\.next on host" -ForegroundColor Yellow
        }
        if (Test-Path "frontend\node_modules\.cache") {
            Remove-Item -Recurse -Force "frontend\node_modules\.cache"
            Write-Host "Removed frontend\node_modules\.cache on host" -ForegroundColor Yellow
        }
        docker compose up -d --force-recreate --no-build frontend
        Write-Host "Waiting for dev server (up to 45s)..." -ForegroundColor Yellow
        $ready = $false
        for ($i = 0; $i -lt 9; $i++) {
            Start-Sleep -Seconds 5
            try {
                $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
                $ready = $true
                break
            } catch { }
        }
        if (-not $ready) {
            Write-Host "WARN - Frontend not responding yet. Check: docker compose logs frontend" -ForegroundColor Yellow
        }
        & "$PSScriptRoot\dev.ps1" verify-ui
        & "$PSScriptRoot\dev.ps1" verify-admin
    }
    "verify-admin" {
        Write-Host "Checking admin layout source in frontend container..." -ForegroundColor Cyan
        $layout = docker compose exec -T frontend sh -c "cat /app/src/app/admin/layout.tsx" 2>$null
        $css = docker compose exec -T frontend sh -c "cat /app/src/app/globals.css" 2>$null
        if (-not $layout -or -not $css) {
            Write-Host "ERROR - Could not read admin files in container. Is frontend running?" -ForegroundColor Red
            break
        }
        $sidebarFixed = ($css -match '\.admin-sidebar') -and ($css -match 'position:\s*fixed')
        $checks = @(
            @{ Name = "data-admin-layout marker"; Ok = $layout -match "fixed-sidebar-v2" },
            @{ Name = "AdminScrollLock"; Ok = $layout -match "AdminScrollLock" },
            @{ Name = "admin-main-column"; Ok = $layout -match "admin-main-column" },
            @{ Name = "sidebar position:fixed in CSS"; Ok = $sidebarFixed },
            @{ Name = "body scroll lock CSS"; Ok = $css -match "html\.admin-route" }
        )
        $failed = 0
        foreach ($c in $checks) {
            if ($c.Ok) {
                Write-Host ("OK - " + $c.Name) -ForegroundColor Green
            } else {
                Write-Host ("FAIL - " + $c.Name) -ForegroundColor Red
                $failed++
            }
        }
        if ($failed -eq 0) {
            Write-Host ""
            Write-Host "Admin sidebar fix is in the container. Hard refresh: Ctrl+Shift+R at http://localhost:3000/admin" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Admin fix NOT fully deployed. Run: .\scripts\dev.ps1 reset-frontend" -ForegroundColor Red
        }
    }
    "verify-ui" {
        Write-Host "Checking http://localhost:3000 ..." -ForegroundColor Cyan
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 15
            $content = $response.Content
            $foundNew = @()
            foreach ($marker in @("Premium Multi-Business", "mesh-bg", "font-display", "text-gradient")) {
                if ($content.Contains($marker)) { $foundNew += $marker }
            }
            $foundOld = @()
            foreach ($marker in @("bg-white text-zinc-900")) {
                if ($content.Contains($marker)) { $foundOld += $marker }
            }
            if ($foundNew.Count -gt 0) {
                Write-Host ("OK - New UI detected: " + ($foundNew -join ", ")) -ForegroundColor Green
            } else {
                Write-Host "WARN - New UI markers not found. Run: .\scripts\dev.ps1 reset-frontend" -ForegroundColor Red
            }
            if ($foundOld.Count -gt 0) {
                Write-Host ("WARN - Old layout still present: " + ($foundOld -join ", ")) -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "ERROR - Could not reach frontend. Run: docker compose up -d frontend" -ForegroundColor Red
            Write-Host $_.Exception.Message
        }
    }
    "migrate" {
        docker compose exec backend php artisan migrate --seed
    }
    "install" {
        docker compose exec backend composer install
        docker compose exec frontend npm install
    }
    "shell" {
        if ($Service -eq "backend") {
            docker compose exec backend bash
        } else {
            docker compose exec frontend sh
        }
    }
    "build-frontend" {
        docker compose exec frontend npm run build
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}
