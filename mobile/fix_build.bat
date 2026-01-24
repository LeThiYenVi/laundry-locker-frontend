@echo off
echo ===================================================
echo   FIX REACT NATIVE BUILD ERROR (LONG PATHS)
echo ===================================================
echo.
echo [1/2] Enabling Windows Long Paths support...
echo (Requires Run as Administrator)
echo.

reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to update registry. 
    echo Please right-click this file and select "Run as administrator".
    pause
    exit /b
)

echo.
echo [2/2] Cleaning Android Build...
cd android
if exist "build" rmdir /s /q "build"
if exist "app\build" rmdir /s /q "app\build"
if exist ".cxx" rmdir /s /q ".cxx"
if exist "app\.cxx" rmdir /s /q "app\.cxx"

call gradlew clean

echo.
echo ===================================================
echo   DONE!
echo   Please go back to your terminal and run:
echo   npm run android
echo ===================================================
pause
