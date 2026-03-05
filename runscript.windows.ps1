$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

Write-Host "== Extinctbook Dev Runner (Windows) ==" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed or not on PATH. Install Docker Desktop and retry." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm is not installed or not on PATH." -ForegroundColor Red
    Write-Host "Install Node.js 20+ and then run: corepack enable" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example (edit secrets as needed)." -ForegroundColor Yellow
}

Write-Host "Starting PostgreSQL + pgAdmin..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Installing dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "Preparing database..." -ForegroundColor Cyan
pnpm --filter @extinctbook/backend db:generate
pnpm --filter @extinctbook/backend db:migrate

Write-Host "Starting admin + backend (turbo dev)..." -ForegroundColor Cyan
pnpm dev
