@echo off
REM Create the cleaning_db database automatically
echo Creating cleaning_db database...

REM Set PostgreSQL bin path
set PGBIN=C:\Program Files\PostgreSQL\16\bin

REM Create database
echo Please enter your PostgreSQL password when prompted:
"%PGBIN%\psql.exe" -U postgres -c "CREATE DATABASE cleaning_db;"

if %errorlevel% equ 0 (
    echo.
    echo ✓ Database created successfully!
) else (
    echo.
    echo Note: If database already exists, you can continue to next steps.
)

echo.
echo Press any key to continue...
pause >nul
