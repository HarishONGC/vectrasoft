@echo off
echo Testing HLS endpoint availability...
echo.

echo 1. Testing MediaMTX HLS server (should return 404 or connection refused, not timeout):
curl -I http://localhost:8888/test/index.m3u8 2>&1
echo.

echo 2. Testing demo-stream:
curl -I http://localhost:8888/demo-stream/index.m3u8 2>&1
echo.

echo 3. Testing kesanapalli-02:
curl -I http://localhost:8888/kesanapalli-02/index.m3u8 2>&1
echo.

echo Test complete. Press any key to exit.
pause
