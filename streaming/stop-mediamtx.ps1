param(
  [string]$PidPath = "$PSScriptRoot\mediamtx.pid",
  [switch]$WithTranscoders = $true
)

$ErrorActionPreference = 'Stop'

if ($WithTranscoders -and (Test-Path "$PSScriptRoot\stop-ffmpeg-transcoders.ps1")) {
  try {
    & "$PSScriptRoot\stop-ffmpeg-transcoders.ps1" | Out-Null
  } catch {
    # Don't block MediaMTX shutdown if transcoders can't be stopped.
    Write-Host "Warning: failed to stop ffmpeg transcoders: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

if (-not (Test-Path $PidPath)) {
  # PID files can be missing if MediaMTX was started manually.
  try {
    $exePath = (Resolve-Path "$PSScriptRoot\mediamtx.exe" -ErrorAction Stop).Path
    $proc = Get-Process mediamtx -ErrorAction SilentlyContinue |
      Where-Object { $_.Path -and (Resolve-Path $_.Path).Path -eq $exePath } |
      Select-Object -First 1
    if ($proc) {
      Stop-Process -Id $proc.Id -Force
      Write-Host "Stopped MediaMTX (PID $($proc.Id))." -ForegroundColor Cyan
      exit 0
    }
  } catch {}

  Write-Host "No PID file found ($PidPath). Nothing to stop." -ForegroundColor Yellow
  exit 0
}

$pidText = (Get-Content $PidPath -ErrorAction Stop | Select-Object -First 1).Trim()
if ($pidText -notmatch '^\d+$') {
  Remove-Item $PidPath -Force -ErrorAction SilentlyContinue
  Write-Host "PID file was invalid; removed." -ForegroundColor Yellow
  exit 0
}

$procId = [int]$pidText
$proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
if ($proc) {
  Stop-Process -Id $procId -Force
  Write-Host "Stopped MediaMTX (PID $procId)." -ForegroundColor Cyan
} else {
  Write-Host "Process $procId not running; cleaning up PID file." -ForegroundColor Yellow
}

Remove-Item $PidPath -Force -ErrorAction SilentlyContinue
