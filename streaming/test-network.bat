@echo off
echo Testing network connectivity to camera...
echo.
echo 1. Ping test:
ping -n 4 117.236.225.211
echo.
echo 2. Telnet test (RTSP port 554):
powershell -Command "Test-NetConnection -ComputerName 117.236.225.211 -Port 554"
echo.
echo 3. Checking Windows Firewall for mediamtx.exe:
powershell -Command "Get-NetFirewallApplicationFilter | Where-Object {$_.Program -like '*mediamtx*'}"
echo.
echo Test complete. Press any key to exit.
pause
