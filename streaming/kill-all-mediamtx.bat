@echo off
echo Stopping all MediaMTX processes...
echo.

taskkill /F /IM mediamtx.exe 2>NUL
if "%ERRORLEVEL%"=="0" (
    echo MediaMTX processes stopped.
) else (
    echo No MediaMTX processes found.
)

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >NUL

echo.
echo All MediaMTX processes stopped. You can now start MediaMTX fresh.
echo Press any key to exit.
pause
