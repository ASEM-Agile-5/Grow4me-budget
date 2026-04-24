#Requires -Version 5.1
<#
.SYNOPSIS
    Tester A - Frontend automated checks (lint, Vitest, production build).

.DESCRIPTION
    Run from project root (folder containing frontend/, backend/, docs/):
      cd "...\Grow4me-budget-design-overhaul"
      .\scripts\run-tester-a-frontend.ps1

    What this tests:
      - ESLint on src/lib + src/test (automation scope; use npm run lint for whole app)
      - Vitest unit/component tests (if present under frontend/)
      - TypeScript + Vite production build (catches compile errors)

    If execution policy blocks:
      powershell -ExecutionPolicy Bypass -File .\scripts\run-tester-a-frontend.ps1
#>

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
Write-Host "[Tester A] Project root: $ProjectRoot" -ForegroundColor Green

Write-Step "Frontend (1/4) - dependencies"
Set-Location "$ProjectRoot\frontend"
if (-not (Test-Path "node_modules")) {
    npm install
    Test-LastExit "npm install (frontend)"
}

Write-Step "Frontend (2/4) - lint (ESLint: src/lib + src/test)"
npm run lint:automation
Test-LastExit "npm run lint:automation"

Write-Step "Frontend (3/4) - unit tests (Vitest)"
npm run test
Test-LastExit "npm run test"

Write-Step "Frontend (4/4) - production build"
npm run build
Test-LastExit "npm run build"

Set-Location $ProjectRoot
Write-Host ""
Write-Host "[Tester A] Frontend automated checks completed successfully." -ForegroundColor Green
Write-Host ""
