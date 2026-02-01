param(
  [string]$PidPath = "$PSScriptRoot\ffmpeg-transcoders.pid"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $PidPath)) {
  Write-Host "No PID file found ($PidPath). Nothing to stop." -ForegroundColor Yellow
  exit 0
}

try {
  $state = Get-Content $PidPath -Raw | ConvertFrom-Json
  foreach ($p in @($state.processes)) {
    if ($p -and $p.pid) {
      $proc = Get-Process -Id ([int]$p.pid) -ErrorAction SilentlyContinue
      if ($proc) {
        Stop-Process -Id $proc.Id -Force
        Write-Host "Stopped ffmpeg ($($p.name)) PID $($p.pid)." -ForegroundColor Cyan
      }
    }
  }
} catch {
  Write-Host "Failed to parse PID file: $($_.Exception.Message)" -ForegroundColor Yellow
} finally {
  Remove-Item $PidPath -Force -ErrorAction SilentlyContinue
}
