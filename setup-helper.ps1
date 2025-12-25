# PostgreSQL Setup Verification and Environment Configuration Script
# This script helps you verify PostgreSQL installation and create the .env file

Write-Host "`n=== PostgreSQL Setup Helper ===" -ForegroundColor Cyan
Write-Host "`nStep 1: Checking PostgreSQL Installation..." -ForegroundColor Yellow

# Check if psql is available
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "✓ PostgreSQL is installed: $pgVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ PostgreSQL is NOT installed or not in PATH" -ForegroundColor Red
    Write-Host "`nPlease install PostgreSQL from:" -ForegroundColor Yellow
    Write-Host "https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Cyan
    Write-Host "`nAfter installation, close this window and run the script again.`n"
    exit 1
}

Write-Host "`nStep 2: Creating .env file..." -ForegroundColor Yellow

# Check if .env.template exists
if (Test-Path "server\.env.template") {
    # Prompt for PostgreSQL password
    Write-Host "`nPlease enter your PostgreSQL password (the one you set during installation):" -ForegroundColor Cyan
    $password = Read-Host -AsSecureString
    $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    # Read template and replace password
    $envContent = Get-Content "server\.env.template" -Raw
    $envContent = $envContent -replace 'your_postgres_password', $passwordPlain
    
    # Save to .env
    $envContent | Set-Content "server\.env" -NoNewline
    
    Write-Host "✓ .env file created successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ .env.template not found in server directory" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Next Steps" -ForegroundColor Yellow
Write-Host "Run these commands to initialize the database:" -ForegroundColor Cyan
Write-Host "  cd server" -ForegroundColor White
Write-Host "  npx prisma generate" -ForegroundColor White
Write-Host "  npx prisma migrate dev --name init" -ForegroundColor White
Write-Host "  npx prisma db seed" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White

Write-Host "`nThen in a NEW terminal:" -ForegroundColor Cyan
Write-Host "  cd .." -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White

Write-Host "`n✓ Setup helper completed!`n" -ForegroundColor Green
