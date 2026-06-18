# Evoke stack runner — progressive dev/test/deploy without full setup upfront.
# Usage: .\scripts\run.ps1 <command> [stack|service] [options]
# Docs: RUN.md

param(
    [Parameter(Position = 0)]
    [string]$Command = "help",

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Remaining
)

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Script:ComposeMode = "dev"
$Script:Stack = "core"
$Script:Profiles = @()

function Show-Help {
    @"

Evoke run — start only what you need (see RUN.md)

Shell entry points (same commands, pick your shell):
  PowerShell  .\scripts\run.ps1 <command> ...
  CMD         scripts\run.cmd <command> ...
  WSL/Linux   ./scripts/run.sh <command> ...

Usage:
  .\scripts\run.ps1 <command> [stack|service] [options]

Stacks:
  core      Frontend + API + Postgres + Redis (default)
  web       core + Nginx :8080
  mysql     Frontend + API + MySQL + Redis
  workers   core + queue + scheduler
  ai        core + AI + Ollama
  full      Everything except MySQL

Commands:
  init | up | down | restart | status | logs | install | migrate
  shell | health | smoke | build | stacks
  prod up | prod down | prod build | prod migrate | prod health

Options:
  --migrate --seed --fresh --no-build --watch --pull --foreground -f --volumes --force

Examples:
  .\scripts\run.ps1 init
  .\scripts\run.ps1 up core --migrate --seed
  .\scripts\run.ps1 up mysql --migrate
  .\scripts\run.ps1 prod up core --migrate
  .\scripts\run.ps1 smoke

Daily UI fixes: .\scripts\dev.ps1
Hosting:         docs/DEPLOYMENT.md

"@ | Write-Host
}

function Test-StackName([string]$Name) {
    $Name -in @("core", "web", "mysql", "workers", "ai", "full")
}

function Get-Flags {
    param([string[]]$Args)
    @{
        Migrate    = ($Args -contains "--migrate") -or ($Args -contains "--seed") -or ($Args -contains "--fresh")
        Seed       = ($Args -contains "--seed") -or ($Args -contains "--fresh")
        Fresh      = $Args -contains "--fresh"
        Build      = -not (($Args -contains "--no-build") -or ($Args -contains "--watch"))
        Pull       = $Args -contains "--pull"
        Foreground = ($Args -contains "--foreground") -or ($Args -contains "-f")
        Volumes    = $Args -contains "--volumes"
        Force      = $Args -contains "--force"
    }
}

function Set-StackProfiles {
    param([string]$StackName)

    $env:DB_CONNECTION = "pgsql"
    $env:DB_HOST = "postgres"
    $env:DB_PORT = "5432"
    $Script:Profiles = @("--profile", "pgsql")

    switch ($StackName) {
        "core" { }
        "web" { $Script:Profiles += @("--profile", "proxy") }
        "mysql" {
            $Script:Profiles = @("--profile", "mysql")
            $env:DB_CONNECTION = "mysql"
            $env:DB_HOST = "mysql"
            $env:DB_PORT = "3306"
        }
        "workers" { $Script:Profiles += @("--profile", "workers") }
        "ai" { $Script:Profiles += @("--profile", "ai") }
        "full" { $Script:Profiles = @("--profile", "full") }
        default {
            Write-Host "Unknown stack: $StackName" -ForegroundColor Red
            Write-Host "Run: .\scripts\run.ps1 stacks"
            exit 1
        }
    }
}

function Get-ComposeFiles {
    if ($Script:ComposeMode -eq "prod") {
        return @("-f", "docker-compose.yml", "-f", "docker-compose.prod.yml")
    }
    return @("-f", "docker-compose.yml")
}

function Invoke-Dc {
    param([string[]]$DcArgs)
    $files = Get-ComposeFiles
    & docker compose @files @Script:Profiles @DcArgs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

function Show-Stacks {
    @"

Stacks — enable only what you need:

  core     frontend, backend, postgres, redis
  web      core + nginx (:8080)
  mysql    frontend, backend, mysql, redis
  workers  core + queue-worker + scheduler
  ai       core + ai-service + ollama
  full     nginx + workers + ai + postgres

"@ | Write-Host
}

function Show-Urls([string]$StackName) {
    Write-Host ""
    Write-Host "URLs:" -ForegroundColor Green
    Write-Host "  Frontend:  http://localhost:3000"
    Write-Host "  Admin:     http://localhost:3000/login"
    Write-Host "  API:       http://localhost:8000/api/v1"
    if ($StackName -in @("web", "full")) { Write-Host "  Proxy:     http://localhost:8080" }
    if ($StackName -in @("ai", "full")) { Write-Host "  AI:        http://localhost:8001" }
    Write-Host ""
    Write-Host "Login: admin@evoke.com / password"
}

function Copy-EnvIfMissing {
    param([string]$Src, [string]$Dest, [bool]$Force)
    if ((Test-Path $Dest) -and -not $Force) {
        Write-Host "  keep  $Dest"
        return
    }
    if (Test-Path $Src) {
        Copy-Item $Src $Dest -Force
        Write-Host "  create $Dest"
    } else {
        Write-Host "  skip  $Dest"
    }
}

function Invoke-Init {
    param([bool]$Force)
    Write-Host "Initializing env files..."
    Copy-EnvIfMissing ".env.example" ".env" $Force
    Copy-EnvIfMissing "backend\.env.example" "backend\.env" $Force
    Copy-EnvIfMissing "frontend\.env.example" "frontend\.env.local" $Force
    Write-Host ""
    Write-Host "Optional later: payments, email, SMS keys in backend\.env"
    Write-Host "Next: .\scripts\run.ps1 up core --migrate --seed"
}

function Invoke-MigrateInternal {
    param($Flags)
    if ($Flags.Fresh) {
        Invoke-Dc @("exec", "-T", "backend", "php", "artisan", "migrate:fresh", "--seed", "--force")
    } elseif ($Flags.Seed) {
        Invoke-Dc @("exec", "-T", "backend", "php", "artisan", "migrate", "--seed", "--force")
    } else {
        Invoke-Dc @("exec", "-T", "backend", "php", "artisan", "migrate", "--force")
    }
}

function Invoke-Up {
    param([string]$StackName, [string[]]$Args)
    $flags = Get-Flags $Args
    Set-StackProfiles $StackName

    Write-Host "Stack: $StackName ($($Script:ComposeMode) mode)"
    Write-Host "Profiles: $($Script:Profiles -join ' ')"

    if ($flags.Pull) {
        Invoke-Dc @("pull", "--ignore-buildable") 2>$null
    }

    $upArgs = @("up")
    if (-not $flags.Foreground) { $upArgs += "-d" }
    if ($flags.Build) { $upArgs += "--build" }

    Invoke-Dc $upArgs

    if ($flags.Migrate) {
        Write-Host ""
        Write-Host "Waiting for backend..."
        Start-Sleep -Seconds 5
        Invoke-MigrateInternal $flags
    }

    Show-Urls $StackName
}

function Invoke-Health {
    $ok = $true
    foreach ($check in @(
            @{ Name = "Frontend"; Url = "http://localhost:3000" },
            @{ Name = "API"; Url = "http://localhost:8000/api/v1/health" }
        )) {
        try {
            $null = Invoke-WebRequest -Uri $check.Url -UseBasicParsing -TimeoutSec 10
            Write-Host ("OK   {0} — {1}" -f $check.Name, $check.Url) -ForegroundColor Green
        } catch {
            Write-Host ("FAIL {0} — {1}" -f $check.Name, $check.Url) -ForegroundColor Red
            $ok = $false
        }
    }
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 5
        Write-Host "OK   Nginx proxy — http://localhost:8080" -ForegroundColor Green
    } catch { }
    if (-not $ok) { exit 1 }
}

function Invoke-Smoke {
    Invoke-Health
    Write-Host ""
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 15
        if ($r.Content -match "Evoke|mesh-bg|font-display") {
            Write-Host "OK   Homepage HTML looks sane" -ForegroundColor Green
        } else {
            Write-Host "WARN Homepage missing expected markers" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "WARN Could not fetch homepage" -ForegroundColor Yellow
    }
    Set-StackProfiles "core"
    $status = Invoke-Dc @("exec", "-T", "backend", "php", "artisan", "migrate:status") 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK   Database reachable from backend" -ForegroundColor Green
    } else {
        Write-Host "WARN migrate:status failed" -ForegroundColor Yellow
    }
}

# Parse positional args from Remaining
$argsList = @($Remaining)
$stackArg = "core"
$serviceArg = "frontend"

if ($argsList.Count -gt 0 -and (Test-StackName $argsList[0])) {
    $stackArg = $argsList[0]
    $argsList = $argsList[1..($argsList.Count - 1)]
}

switch ($Command.ToLower()) {
    "help" { Show-Help }
    "stacks" { Show-Stacks }
    "init" {
        $f = Get-Flags $argsList
        Invoke-Init $f.Force
    }
    "up" {
        Invoke-Up $stackArg $argsList
    }
    "build" {
        $null = Get-Flags $argsList
        Set-StackProfiles $stackArg
        Invoke-Dc @("build")
    }
    "down" {
        $f = Get-Flags $argsList
        if ($f.Volumes) {
            docker compose -f docker-compose.yml down -v
        } else {
            docker compose -f docker-compose.yml down
        }
    }
    "restart" {
        if ($argsList.Count -gt 0 -and -not $argsList[0].StartsWith("--")) {
            $serviceArg = $argsList[0]
        }
        Set-StackProfiles "core"
        Invoke-Dc @("restart", $serviceArg)
    }
    "status" {
        docker compose -f docker-compose.yml ps -a
    }
    "logs" {
        if ($argsList.Count -gt 0 -and -not $argsList[0].StartsWith("--")) {
            $serviceArg = $argsList[0]
        }
        Set-StackProfiles "core"
        Invoke-Dc @("logs", "-f", $serviceArg)
    }
    "install" {
        Set-StackProfiles "core"
        Invoke-Dc @("exec", "-T", "backend", "composer", "install", "--no-interaction")
        Invoke-Dc @("exec", "-T", "frontend", "npm", "install")
    }
    "migrate" {
        $f = Get-Flags $argsList
        Set-StackProfiles $stackArg
        Invoke-MigrateInternal $f
    }
    "shell" {
        if ($argsList.Count -gt 0 -and -not $argsList[0].StartsWith("--")) {
            $serviceArg = $argsList[0]
        }
        Set-StackProfiles "core"
        if ($serviceArg -eq "backend") {
            Invoke-Dc @("exec", "backend", "bash")
        } else {
            Invoke-Dc @("exec", "frontend", "sh")
        }
    }
    "health" { Invoke-Health }
    "smoke" { Invoke-Smoke }
    "prod" {
        $Script:ComposeMode = "prod"
        $prodCmd = if ($argsList.Count -gt 0) { $argsList[0] } else { "help" }
        $prodRest = if ($argsList.Count -gt 1) { $argsList[1..($argsList.Count - 1)] } else { @() }

        if ($prodRest.Count -gt 0 -and (Test-StackName $prodRest[0])) {
            $stackArg = $prodRest[0]
            $prodRest = $prodRest[1..($prodRest.Count - 1)]
        }

        switch ($prodCmd.ToLower()) {
            "up" { Invoke-Up $stackArg $prodRest }
            "down" {
                $f = Get-Flags $prodRest
                if ($f.Volumes) { docker compose -f docker-compose.yml down -v }
                else { docker compose -f docker-compose.yml down }
            }
            "build" {
                Set-StackProfiles $stackArg
                Invoke-Dc @("build")
            }
            "migrate" {
                $f = Get-Flags $prodRest
                Set-StackProfiles $stackArg
                Invoke-MigrateInternal $f
            }
            "health" { Invoke-Health }
            default {
                Write-Host "Prod: prod up|down|build|migrate|health [stack]"
                exit 1
            }
        }
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
        exit 1
    }
}
