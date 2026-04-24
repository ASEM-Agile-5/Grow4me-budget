#Requires -Version 5.1
<#
.SYNOPSIS
    Run automated local tests for GrowForMe Farm Budget (design-overhaul repo).

.DESCRIPTION
    Steps (in order):
      1. Frontend: npm install (if needed), lint (src/lib + src/test only), vitest, production build
      2. TDD contract: Jest suite in docs/sprint-1/tdd (financial logic + coverage gates)
      3. Backend: Django manage.py test (optional; needs Python, venv, and DB/settings)

    Usage (from PowerShell, repo root = folder that contains frontend/, backend/, docs/):
      cd "C:\path\to\Grow4me-budget-design-overhaul"
      .\scripts\run-local-tests.ps1

    Skip Django if you have no DB configured yet:
      .\scripts\run-local-tests.ps1 -SkipBackend

    If execution policy blocks scripts:
      powershell -ExecutionPolicy Bypass -File .\scripts\run-local-tests.ps1

.NOTES
    After this passes, run the app manually: backend runserver + frontend npm run dev,
    then follow docs/sprint-1/feature-vertical-slice.md for exploratory checks.

    Two testers: see docs/project/TESTING_TWO_TESTERS.md
      - Tester A: scripts/run-tester-a-frontend.ps1
      - Tester B: scripts/run-tester-b-tdd-backend.ps1
#>

param(
    [switch]$SkipBackend
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "=== $Message ===" -ForegroundColor Cyan
    Write-Host ""
}

function Test-LastExit {
    param([string]$StepName)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $StepName (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Set-Location $ProjectRoot
Write-Host "Project root: $ProjectRoot" -ForegroundColor Green

# --- 1) Frontend ---
Write-Step "Frontend (1/4) - dependencies"
Set-Location "$ProjectRoot\frontend"
if (-not (Test-Path "node_modules")) {
    npm install
    Test-LastExit "npm install (frontend)"
}

Write-Step "Frontend (2/4) - lint (src/lib + src/test; full app: npm run lint)"
npm run lint:automation
Test-LastExit "npm run lint:automation"

Write-Step "Frontend (3/4) - unit tests (Vitest)"
npm run test
Test-LastExit "npm run test"

Write-Step "Frontend (4/4) - production build"
npm run build
Test-LastExit "npm run build"

# --- 2) TDD / Jest contract ---
Write-Step "TDD contract - docs/sprint-1/tdd (Jest + coverage)"
Set-Location "$ProjectRoot\docs\sprint-1\tdd"
if (-not (Test-Path "node_modules")) {
    npm install
    Test-LastExit "npm install (tdd)"
}
npm test
Test-LastExit "npm test (tdd)"

# --- 3) Django (optional) ---
if ($SkipBackend) {
    Write-Host ""
    Write-Host "Skipped backend tests (-SkipBackend)." -ForegroundColor Yellow
} else {
    Write-Step "Backend - Django tests"
    Set-Location "$ProjectRoot\backend\grow4me_budget_app"

    $pythonCmd = $null
    foreach ($name in @("python", "py")) {
        $c = Get-Command $name -ErrorAction SilentlyContinue
        if ($c) {
            $pythonCmd = $name
            break
        }
    }
    if (-not $pythonCmd) {
        Write-Host "Python not found on PATH. Install Python or use -SkipBackend." -ForegroundColor Yellow
        exit 1
    }

    # Prefer project venv if present
    $venvPy = Join-Path $ProjectRoot "backend\.venv\Scripts\python.exe"
    if (Test-Path $venvPy) {
        & $venvPy manage.py test
    } else {
        & $pythonCmd manage.py test
    }
    Test-LastExit "manage.py test"
}

Set-Location $ProjectRoot
Write-Host ""
Write-Host "All requested steps completed successfully." -ForegroundColor Green
Write-Host "Next: start backend (if used):  cd backend\grow4me_budget_app ; python manage.py runserver"
Write-Host "        start frontend:           cd frontend ; npm run dev"
Write-Host ""
