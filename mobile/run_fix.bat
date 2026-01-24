@echo off
echo ===================================================
echo   FIXING LONG PATH ISSUE (VIRTUAL DRIVE STRATEGY)
echo ===================================================
echo.
echo Mapping project folder to L: drive...
subst L: "D:\capstone-laundry-locker\laundry-locker-frontend\app-laundry-locker"

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Could not map L: drive. It might already exist.
    echo Trying to use current drive...
) else (
    echo Drive mapped successfully!
    echo Switching to L: drive...
    L:
)

echo.
echo [CLEANING]
if exist "android\build" rmdir /s /q "android\build"
if exist "android\app\build" rmdir /s /q "android\app\build"
if exist "android\app\.cxx" rmdir /s /q "android\app\.cxx"

echo.
echo [BUILDING]
echo Running 'npm run android' from short path...
call npm run android

echo.
echo ===================================================
echo   DONE!
echo ===================================================
pause
