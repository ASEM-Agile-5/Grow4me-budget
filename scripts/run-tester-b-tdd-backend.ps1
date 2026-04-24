#Requires -Version 5.1
<#
.SYNOPSIS
    Tester B - TDD contract (Jest) + Django backend tests.

.DESCRIPTION
    Run from project root:
      cd "...\Grow4me-budget-design-overhaul"
      .\scripts\run-tester-b-tdd-backend.ps1

    Skip Django if database/settings are not ready:
      .\scripts\run-tester-b-tdd-backend.ps1 -SkipBackend

    What this tests:
      - docs/sprint-1/tdd: Jest tests for budget calculator, summary, input validator
        (coverage thresholds apply per package.json there)
      - backend: Django test modules (budget, members, project apps) via manage.py test

    If execution policy blocks:
      powershell -ExecutionPolicy Bypass -File .\scripts\run-tester-b-tdd-backend.ps1
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
Write-Host "[Tester B] Project root: $ProjectRoot" -ForegroundColor Green

Write-Step "TDD contract - docs/sprint-1/tdd (Jest + coverage)"
Set-Location "$ProjectRoot\docs\sprint-1\tdd"
if (-not (Test-Path "node_modules")) {
    npm install
    Test-LastExit "npm install (tdd)"
}
npm test
Test-LastExit "npm test (tdd)"

if ($SkipBackend) {
    Write-Host ""
    Write-Host "[Tester B] Skipped Django tests (-SkipBackend)." -ForegroundColor Yellow
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
        Write-Host "Python not found on PATH. Use -SkipBackend or install Python." -ForegroundColor Yellow
        exit 1
    }

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
Write-Host "[Tester B] TDD/backend automated checks completed successfully." -ForegroundColor Green
Write-Host ""
