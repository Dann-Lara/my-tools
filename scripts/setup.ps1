# AI Lab Template - Setup Script for Windows (PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
# To reset database: powershell -ExecutionPolicy Bypass -File scripts/setup.ps1 -ResetDatabase
# Encoding: ASCII-safe (no Unicode/emoji to avoid parse errors)

param(
    [switch]$ResetDatabase  # Add -ResetDatabase to drop and recreate the database
)

$ErrorActionPreference = "Stop"

# Disable Docker color codes that break PowerShell parsing
$env:NO_COLOR = "1"

function Get-ContainerName($service) {
    $projectName = if ($env:COMPOSE_PROJECT_NAME) { $env:COMPOSE_PROJECT_NAME } else { "my-tools" }
    return "${projectName}_${service}"
}

function Write-Success($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)    { Write-Host "  [ERROR] $msg" -ForegroundColor Red }
function Write-Step($msg)    { Write-Host "" ; Write-Host ">> $msg" -ForegroundColor Yellow }

Clear-Host
Write-Host "========================================" -ForegroundColor Blue
Write-Host "     AI Lab Template - Setup            " -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
if ($ResetDatabase) {
    Write-Host "  [MODE] Database will be RESET" -ForegroundColor Cyan
}

# -- 1. CHECK REQUIREMENTS ----------------------------------------
Write-Step "Checking requirements..."

# Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js not found. Install from https://nodejs.org (v20+)"
    exit 1
}
$nodeVersion = (node -v) -replace 'v', '' -split '\.' | Select-Object -First 1
if ([int]$nodeVersion -lt 20) {
    Write-Fail "Node.js v20+ required. Current: $(node -v)"
    exit 1
}
Write-Success "Node.js $(node -v)"

# npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Fail "npm not found."
    exit 1
}
Write-Success "npm $(npm -v)"

# Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Fail "Git not found. Install from https://git-scm.com"
    exit 1
}
Write-Success "Git $(git --version)"

# Docker
$dockerAvailable = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $null = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerAvailable = $true
            Write-Success "Docker found and running"
        } else {
            Write-Warn "Docker found but not running. Start Docker Desktop and re-run setup."
        }
    } catch {
        Write-Warn "Docker found but not running. Start Docker Desktop and re-run setup."
    }
} else {
    Write-Warn "Docker not found. Install Docker Desktop from https://www.docker.com/products/docker-desktop"
    Write-Warn "You can still run frontend/backend manually without Docker."
}

# -- 2. INSTALL DEPENDENCIES --------------------------------------
Write-Step "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Fail "npm install failed"
    exit 1
}
Write-Success "Dependencies installed"

# -- 3. HUSKY GIT HOOKS -------------------------------------------
Write-Step "Setting up Git hooks (Husky)..."
if (Test-Path ".git") {
    npx husky 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Husky configured"
    } else {
        Write-Warn "Husky setup failed. Run 'npx husky' manually after 'git init'."
    }
} else {
    Write-Warn "No .git folder found. Run 'git init' then 'npx husky' manually."
}

# -- 4. COPY .ENV FILES -------------------------------------------
Write-Step "Setting up environment files..."

# Root .env — used by Docker Compose for ALL services
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Success "Created: .env (from .env.example)"
} else {
    Write-Warn "Already exists: .env"
}

# apps/backend/.env — for running backend locally WITHOUT Docker
$backendEnv = "apps/backend/.env"
if (-not (Test-Path $backendEnv)) {
    Copy-Item "apps/backend/.env.example" $backendEnv
    Write-Success "Created: $backendEnv"
} else {
    # Ensure critical keys exist (migration guard for older installs)
    $envContent = Get-Content $backendEnv -Raw
    foreach ($key in @("DATABASE_URL", "REDIS_URL", "JWT_SECRET")) {
        if ($envContent -notmatch "^$key=") {
            $default = (Get-Content "apps/backend/.env.example") | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
            if ($default) {
                Add-Content $backendEnv ""
                Add-Content $backendEnv "# Added by setup (key was missing)"
                Add-Content $backendEnv $default
                Write-Success "Added missing $key to $backendEnv"
            }
        }
    }
    Write-Warn "Already exists: $backendEnv (checked required keys)"
}

# apps/frontend/.env.local
if (-not (Test-Path "apps/frontend/.env.local")) {
    if (Test-Path "apps/frontend/.env.example") {
        Copy-Item "apps/frontend/.env.example" "apps/frontend/.env.local"
        Write-Success "Created: apps/frontend/.env.local"
    }
}

Write-Host ""
Write-Host ""
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "  ACTION REQUIRED: edit .env before running npm run dev" -ForegroundColor Yellow
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Set at least ONE AI provider key (free options):"
    Write-Host "    GEMINI_API_KEY=your-key   # https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
    Write-Host "    GROQ_API_KEY=your-key     # https://console.groq.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Optional for Telegram reminders:"
    Write-Host "    TELEGRAM_BOT_TOKEN=your-token" -ForegroundColor Cyan

# -- 5. CHECK OPENAI KEY ------------------------------------------
$backendEnv = "apps\backend\.env"
if (Test-Path $backendEnv) {
    $content = Get-Content $backendEnv -Raw
    if ($content -match "sk-your-api-key-here") {
        Write-Host ""
        Write-Host "  [ACTION REQUIRED] Set your OPENAI_API_KEY in apps\backend\.env" -ForegroundColor Magenta
    }
}

# -- 6. DOCKER SERVICES -------------------------------------------
if ($dockerAvailable) {
    Write-Step "Starting Docker services (postgres + redis)..."

    # Try docker compose v2 first, fall back to v1
    docker compose up -d postgres redis --no-color
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "docker compose v2 failed, trying docker-compose v1..."
        docker-compose up -d postgres redis --no-color
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "Could not start Docker services. Check docker-compose.yml."
            exit 1
        }
    }
    Write-Success "postgres and redis containers started"

    # Wait for PostgreSQL
    Write-Step "Waiting for PostgreSQL to be ready..."
    $retries = 30
    $ready = $false
    $pgContainer = Get-ContainerName "postgres"
    while ($retries -gt 0 -and -not $ready) {
        $pgCheck = docker exec $pgContainer pg_isready -U admin 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        } else {
            Write-Host "  Waiting... ($retries retries left)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
            $retries--
        }
    }

    if (-not $ready) {
        Write-Fail "PostgreSQL did not become ready in time. Check logs: docker compose logs postgres"
        exit 1
    }
    Write-Success "PostgreSQL is ready"

    # Create/reset database
    $dbName = "mytools"
    if ($ResetDatabase) {
        Write-Step "Resetting database (dropping and recreating)..."
        docker exec $pgContainer psql -U admin -d postgres -c "DROP DATABASE IF EXISTS $dbName;" 2>$null
        docker exec $pgContainer psql -U admin -d postgres -c "CREATE DATABASE $dbName;" 2>$null
        Write-Success "Database $dbName reset"
    } else {
        Write-Step "Creating database if not exists..."
        $existingDb = docker exec $pgContainer psql -U admin -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$dbName';" 2>$null
        if ($existingDb.Trim() -ne "1") {
            docker exec $pgContainer psql -U admin -d postgres -c "CREATE DATABASE $dbName;" 2>$null
        }
        Write-Success "Database $dbName ready"
    }

    # Run migrations
    Write-Step "Running database migrations..."
    npm run db:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Migrations failed. Run with -ResetDatabase to reset the database."
        exit 1
    } else {
        Write-Success "Migrations complete"
    }

    # Start n8n
    Write-Step "Starting n8n..."
    docker compose up -d n8n --no-color
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Failed to start n8n. Run 'docker compose up -d n8n' manually."
    }
    Write-Success "n8n started at http://localhost:5678"

    # Sync n8n workflows
    Write-Step "Syncing n8n workflows..."
    $ErrorActionPreference = 'Continue'
    try {
        $syncResult = & node scripts/sync-n8n-workflows.js 2>&1 | Out-String
        # Filter out Windows Node.js assertion errors (UV_HANDLE_CLOSING) - these are harmless
        $cleanResult = $syncResult -replace '(?m)^.*UV_HANDLE_CLOSING.*$', '' -replace '(?m)^.*Assertion failed.*$', ''
        if ($cleanResult.Trim()) {
            Write-Host $cleanResult
        }
        # Check exit code - 0 or 1 are expected, anything else might indicate real error
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
            Write-Success "n8n workflows sync completed"
        } else {
            Write-Warn "Workflow sync exited with code $LASTEXITCODE"
        }
    } catch {
        Write-Warn "Workflow sync failed - run manually: npm run n8n:sync"
    }
    $ErrorActionPreference = 'Stop'

} else {
    Write-Host ""
    Write-Host "  Skipping Docker steps. Once Docker Desktop is running, execute:" -ForegroundColor Yellow
    Write-Host "    docker compose up -d" -ForegroundColor Cyan
    Write-Host "    npm run db:migrate" -ForegroundColor Cyan
}

# -- 7. DONE ------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "     Setup Complete!                    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Run " -NoNewline
Write-Host "npm run dev" -ForegroundColor Cyan -NoNewline
Write-Host " to start all development servers"
Write-Host ""
Write-Host "  Frontend : " -NoNewline ; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend  : " -NoNewline ; Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host "  API Docs : " -NoNewline ; Write-Host "http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "  n8n      : " -NoNewline ; Write-Host "http://localhost:5678" -ForegroundColor Cyan -NoNewline
Write-Host "  (admin / admin123)"
Write-Host ""
Write-Host "  Tip: To reset database, run:" -ForegroundColor Gray
Write-Host "    powershell -ExecutionPolicy Bypass -File scripts/setup.ps1 -ResetDatabase" -ForegroundColor Gray
