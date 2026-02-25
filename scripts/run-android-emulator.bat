@echo off
setlocal
title House Booking - Android Emulator
cd /d "%~dp0\.."

echo.
echo  ========================================
echo   House Booking - Android Emulator
echo  ========================================
echo.

REM Backend should be running (e.g. start.bat). Emulator uses 10.0.2.2:3000 for API.
set "MOBILE_DIR=%~dp0..\mobile-app"
if not exist "%MOBILE_DIR%\package.json" (
    echo  Error: mobile-app not found. Run from repo root.
    pause
    exit /b 1
)

REM ANDROID_HOME (default if not set)
if not defined ANDROID_HOME set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "EMULATOR=%ANDROID_HOME%\emulator\emulator.exe"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"

if not exist "%EMULATOR%" (
    echo  Android SDK/emulator not found at %ANDROID_HOME%
    echo  Run scripts\install-android-emulator.ps1 first, then create an AVD in Android Studio.
    pause
    exit /b 1
)

echo  [1/5] Building mobile app...
cd /d "%MOBILE_DIR%"
call npm run build
if errorlevel 1 (echo  Build failed. & pause & exit /b 1)

echo.
echo  [2/5] Syncing Capacitor...
call npx cap sync android
if errorlevel 1 (echo  Sync failed. & pause & exit /b 1)

echo.
echo  [3/5] Checking emulator...
"%ADB%" devices | findstr /r "emulator-[0-9]" >nul 2>&1
if errorlevel 1 (
    echo  No emulator running. Starting first available AVD...
    for /f "delims=" %%i in ('"%EMULATOR%" -list-avds 2^>nul') do (
        echo  Booting %%i
        start "" "%EMULATOR%" -avd "%%i"
        goto :avd_started
    )
    echo  No AVD found. Open Android Studio - Device Manager - Create Device, then run this script again.
    pause
    exit /b 1
    :avd_started
    echo  Waiting for emulator to boot, up to 60 seconds...
    "%ADB%" wait-for-device
    timeout /t 15 /nobreak >nul
) else (
    echo  Emulator already running.
)

REM Forward emulator's port 3000 to host's 3000 so app can reach backend via 127.0.0.1:3000
echo  Setting adb reverse tcp:3000 tcp:3000...
"%ADB%" reverse tcp:3000 tcp:3000

echo.
echo  [4/5] Installing app on emulator...
REM Use Java 11+ for Gradle (Android Studio's bundled JDK). Required by Android Gradle Plugin 8.x.
if exist "%LOCALAPPDATA%\Programs\Android Studio\jbr" set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jbr"
if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jbr" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
cd /d "%MOBILE_DIR%\android"
call gradlew.bat installDebug
if errorlevel 1 (echo  Install failed. & cd /d "%~dp0\.." & pause & exit /b 1)

echo.
echo  [5/5] Launching House Booking...
"%ADB%" shell am start -n com.getcapacitor.app/com.getcapacitor.myapp.MainActivity
cd /d "%~dp0\.."

echo.
echo  Done. App should be open on the emulator.
echo  Backend: ensure start.bat is running. App uses 127.0.0.1:3000 with adb reverse.
echo.
pause
