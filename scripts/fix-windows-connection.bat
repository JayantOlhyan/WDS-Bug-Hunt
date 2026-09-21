@echo off
title MSIT WDS Bug Hunt - Connection Diagnostic ^& Fix Tool
color 0A
cls
echo ================================================================
echo    MSIT WDS BUG HUNT - NETWORK DIAGNOSTIC ^& AUTOMATED FIX
echo ================================================================
echo.
echo [1/4] Flushing DNS Cache...
ipconfig /flushdns
echo.
echo [2/4] Resetting Winsock and IP Configuration...
netsh winsock reset >nul 2>&1
netsh int ip reset >nul 2>&1
echo       Done.
echo.
echo [3/4] Disabling Windows System Proxy (if stuck)...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f >nul 2>&1
echo       Done.
echo.
echo [4/4] Testing TCP Port 443 Connectivity to wds-bug-hunt.netlify.app...
powershell -Command "$res = Test-NetConnection wds-bug-hunt.netlify.app -Port 443; if ($res.TcpTestSucceeded) { Write-Host 'SUCCESS: Connection to Netlify server established on Port 443!' -ForegroundColor Green } else { Write-Host 'FAILED: Port 443 connection timed out. Your Wi-Fi/ISP firewall is blocking Netlify.' -ForegroundColor Red }"
echo.
echo ================================================================
echo                         RESULTS ^& NEXT STEPS
echo ================================================================
echo.
echo IF THE TEST SUCCEEDED:
echo   1. Open Google Chrome.
echo   2. Paste this into Chrome URL bar and press Enter:
echo      chrome://net-internals/#sockets
echo   3. Click the 'Flush socket pools' button.
echo   4. Open: https://wds-bug-hunt.netlify.app/bug-hunt
echo.
echo IF THE TEST FAILED:
echo   Your current Wi-Fi (e.g. College Wi-Fi / ISP) is blocking Netlify.
echo   To fix immediately without changing domain:
echo   - Switch to Mobile Hotspot (phone 4G/5G data).
echo     OR
echo   - Turn ON Cloudflare 1.1.1.1 WARP (from https://1.1.1.1)
echo.
pause
