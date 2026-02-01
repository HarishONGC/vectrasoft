@echo off
echo Adding Windows Firewall rule for MediaMTX...
echo This requires Administrator privileges.
echo.

REM Add inbound and outbound rules for MediaMTX
netsh advfirewall firewall add rule name="MediaMTX Inbound" dir=in action=allow program="%~dp0mediamtx.exe" enable=yes
netsh advfirewall firewall add rule name="MediaMTX Outbound" dir=out action=allow program="%~dp0mediamtx.exe" enable=yes

echo.
echo Firewall rules added!
echo Press any key to exit.
pause
