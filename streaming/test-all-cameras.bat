@echo off
echo Testing all Kesanapalli cameras network connectivity...
echo.

echo Testing Kesanapalli-01 (117.236.225.209):
powershell -Command "Test-NetConnection -ComputerName 117.236.225.209 -Port 554 -InformationLevel Quiet" && echo SUCCESS || echo FAILED
echo.

echo Testing Kesanapalli-02 (117.236.225.211):
powershell -Command "Test-NetConnection -ComputerName 117.236.225.211 -Port 554 -InformationLevel Quiet" && echo SUCCESS || echo FAILED
echo.

echo Testing Kesanapalli-03 (117.236.225.212):
powershell -Command "Test-NetConnection -ComputerName 117.236.225.212 -Port 554 -InformationLevel Quiet" && echo SUCCESS || echo FAILED
echo.

echo Testing Kesanapalli-04 (117.236.225.213):
powershell -Command "Test-NetConnection -ComputerName 117.236.225.213 -Port 554 -InformationLevel Quiet" && echo SUCCESS || echo FAILED
echo.

echo Test complete. Press any key to exit.
pause
