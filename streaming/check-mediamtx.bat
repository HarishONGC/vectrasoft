@echo off
echo Checking MediaMTX status...
echo.

echo 1. Is MediaMTX process running?
tasklist /FI "IMAGENAME eq mediamtx.exe" 2>NUL | find /I /N "mediamtx.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo YES - MediaMTX is running
) else (
    echo NO - MediaMTX is NOT running
)
echo.

echo 2. Is HLS port 8888 listening?
netstat -ano | findstr :8888 | findstr LISTENING
if "%ERRORLEVEL%"=="0" (
    echo YES - Port 8888 is listening
) else (
    echo NO - Port 8888 is NOT listening
)
echo.

echo 3. Testing HTTP connection to MediaMTX:
curl -s -o NUL -w "HTTP Status: %%{http_code}\n" http://localhost:8888/
echo.

echo Press any key to exit.
pause
