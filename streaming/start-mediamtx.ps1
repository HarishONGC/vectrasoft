param(
  [string]$ConfigPath = "$PSScriptRoot\mediamtx.yml",
  [string]$ExePath = "$PSScriptRoot\mediamtx.exe",
  [string]$PidPath = "$PSScriptRoot\mediamtx.pid",
  [string]$LogPath = "$PSScriptRoot\mediamtx.log",
  [string]$ErrLogPath = "$PSScriptRoot\mediamtx.err.log"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $ConfigPath)) {
  Write-Host "Missing config: $ConfigPath" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $ExePath)) {
  Write-Host "MediaMTX executable not found: $ExePath" -ForegroundColor Red
  Write-Host "Download MediaMTX for Windows from https://github.com/bluenviron/mediamtx/releases" -ForegroundColor Yellow
  exit 1
}

# Ensure we don't leave a previous instance running (PID files can go stale).
try {
  Get-Process mediamtx -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -and (Resolve-Path $_.Path).Path -eq (Resolve-Path $ExePath).Path } |
    ForEach-Object { Stop-Process -Id $_.Id -Force }
} catch {}

# Stop any previous instance started by this script.
if (Test-Path $PidPath) {
  try {
    $oldPid = Get-Content $PidPath -ErrorAction Stop | Select-Object -First 1
    if ($oldPid -match '^\d+$') {
      $proc = Get-Process -Id [int]$oldPid -ErrorAction SilentlyContinue
      if ($proc) {
        Stop-Process -Id $proc.Id -Force
        Write-Host "Stopped previous MediaMTX PID $oldPid" -ForegroundColor DarkGray
      }
    }
  } catch {}
  Remove-Item $PidPath -Force -ErrorAction SilentlyContinue
}

$arg = "`"$ConfigPath`""
if (Test-Path $LogPath) {
  try { Remove-Item $LogPath -Force -ErrorAction SilentlyContinue } catch {}
}
if (Test-Path $ErrLogPath) {
  try { Remove-Item $ErrLogPath -Force -ErrorAction SilentlyContinue } catch {}
}

$proc = Start-Process -FilePath $ExePath -ArgumentList $arg -WorkingDirectory $PSScriptRoot -WindowStyle Minimized -RedirectStandardOutput $LogPath -RedirectStandardError $ErrLogPath -PassThru
Set-Content -Path $PidPath -Value $proc.Id -Encoding ASCII

Write-Host "MediaMTX started (PID $($proc.Id))." -ForegroundColor Cyan
Write-Host "HLS: http://localhost:8888/<path>/index.m3u8" -ForegroundColor Cyan
Write-Host "WebRTC (WHEP): http://localhost:8889/<path>/whep" -ForegroundColor Cyan
Write-Host "Logs: $LogPath" -ForegroundColor DarkGray
Write-Host "Errors: $ErrLogPath" -ForegroundColor DarkGray
Write-Host "Stop it with: ./stop-mediamtx.ps1" -ForegroundColor DarkGray
