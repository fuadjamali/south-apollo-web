# PowerShell equivalent of scripts/dev.js - for when Docker Desktop is already running and you
# just want the DB container + Next.js dev server started together in one command.
#
# Run with: npm run dev:full:ps1   (or  .\scripts\dev.ps1  /  powershell -File scripts\dev.ps1)
#
# Assumes Docker Desktop is already up (start it yourself first) - this script only brings up
# the falcon-web-db Postgres container (docker-compose.yml's postgres service), waits until it
# is actually accepting connections, then runs "next dev".

$DbContainer = "falcon-web-db"
$DbUser = "falcon"
$MaxWaitSeconds = 30
$PollIntervalSeconds = 1

function Test-DockerRunning {
    docker info *> $null
    return $LASTEXITCODE -eq 0
}

function Start-DbContainer {
    Write-Host "Starting $DbContainer..."
    docker compose up -d postgres
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start the database container."
        exit 1
    }
}

function Test-DbReady {
    docker exec $DbContainer pg_isready -U $DbUser *> $null
    return $LASTEXITCODE -eq 0
}

function Wait-ForDb {
    $deadline = (Get-Date).AddSeconds($MaxWaitSeconds)
    Write-Host -NoNewline "Waiting for Postgres to accept connections"
    while ((Get-Date) -lt $deadline) {
        if (Test-DbReady) {
            Write-Host " ready."
            return $true
        }
        Write-Host -NoNewline "."
        Start-Sleep -Seconds $PollIntervalSeconds
    }
    Write-Host ""
    return $false
}

if (-not (Test-DockerRunning)) {
    Write-Error "Docker does not seem to be running. Start Docker Desktop, then run this again."
    exit 1
}

Start-DbContainer

if (-not (Wait-ForDb)) {
    $message = "Postgres in " + $DbContainer + " did not become ready within " + $MaxWaitSeconds + "s - check docker logs " + $DbContainer + " for details."
    Write-Error $message
    exit 1
}

Write-Host "Starting Next.js dev server..."
Write-Host ""
npx next dev
exit $LASTEXITCODE
