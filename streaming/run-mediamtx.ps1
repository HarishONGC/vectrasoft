param(
  [string]$ConfigPath = "$PSScriptRoot\mediamtx.yml",
  [string]$ExePath = "$PSScriptRoot\mediamtx.exe",
  [switch]$WithTranscoders = $true,
  [switch]$OpenFirewall = $false,
  [int]$StartupTimeoutSeconds = 20
)

$ErrorActionPreference = 'Stop'

function Test-IsAdmin {
  try {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $p = New-Object Security.Principal.WindowsPrincipal($id)
    return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  } catch {
    return $false
  }
}

function Ensure-FirewallRule {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][ValidateSet('TCP', 'UDP')][string]$Protocol,
    [Parameter(Mandatory = $true)][int]$LocalPort
  )

  $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
  if ($existing) { return }
  New-NetFirewallRule -DisplayName $Name -Direction Inbound -Action Allow -Enabled True -Protocol $Protocol -LocalPort $LocalPort | Out-Null
}

function Wait-ForHttpListener {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][int]$TimeoutSeconds
  )

  $deadline = (Get-Date).AddSeconds([Math]::Max(1, $TimeoutSeconds))
  while ((Get-Date) -lt $deadline) {
    try {
      # The root might return 404; that's still proof the listener is up.
      Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 -Method GET -Uri $Url | Out-Null
      return $true
    } catch {
      $msg = $_.Exception.Message
      if ($msg -match '404' -or $msg -match 'Not Found') { return $true }
      Start-Sleep -Milliseconds 400
    }
  }
  return $false
}

if (-not (Test-Path $ConfigPath)) {
  Write-Host "Missing config: $ConfigPath" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $ExePath)) {
  Write-Host "MediaMTX executable not found: $ExePath" -ForegroundColor Yellow
  Write-Host "Download MediaMTX for Windows from https://github.com/bluenviron/mediamtx/releases" -ForegroundColor Yellow
  Write-Host "Then place mediamtx.exe next to this script (streaming\\mediamtx.exe)." -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting MediaMTX with config: $ConfigPath" -ForegroundColor Cyan
Write-Host "HLS will be served at: http://localhost:8888/<path>/index.m3u8" -ForegroundColor Cyan
Write-Host "WebRTC (WHEP) will be served at: http://localhost:8889/<path>/whep" -ForegroundColor Cyan
Write-Host "Stop with Ctrl+C (will stop MediaMTX + transcoders)" -ForegroundColor DarkGray

if ($OpenFirewall) {
  if (-not (Test-IsAdmin)) {
    Write-Host 'OpenFirewall requested but PowerShell is not elevated. Run as Administrator or omit -OpenFirewall.' -ForegroundColor Yellow
  } else {
    try {
      Ensure-FirewallRule -Name 'CCTV Dashboard - MediaMTX WebRTC HTTP (TCP 8889)' -Protocol TCP -LocalPort 8889
      Ensure-FirewallRule -Name 'CCTV Dashboard - MediaMTX WebRTC ICE (UDP 8189)' -Protocol UDP -LocalPort 8189
      Write-Host 'Firewall rules ensured for WebRTC: TCP 8889, UDP 8189.' -ForegroundColor DarkGray
    } catch {
      Write-Host "Warning: failed to configure firewall rules: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
} else {
  Write-Host 'Note: WebRTC requires inbound UDP 8189 (ICE). If playback fails, allow UDP 8189 in Windows Firewall.' -ForegroundColor DarkGray
}

# Start MediaMTX in the background (with log files) so we can also start ffmpeg.
& "$PSScriptRoot\start-mediamtx.ps1" -ConfigPath $ConfigPath -ExePath $ExePath | Out-Null
Start-Sleep -Seconds 1

Write-Host "Waiting for MediaMTX WebRTC HTTP listener (:8889)..." -ForegroundColor DarkGray
if (-not (Wait-ForHttpListener -Url 'http://localhost:8889/' -TimeoutSeconds $StartupTimeoutSeconds)) {
  Write-Host "Warning: WebRTC HTTP listener did not become reachable within ${StartupTimeoutSeconds}s. Check streaming\\mediamtx.err.log" -ForegroundColor Yellow
} else {
  Write-Host 'WebRTC listener is reachable.' -ForegroundColor Cyan
}

if ($WithTranscoders) {
  if (Test-Path "$PSScriptRoot\start-ffmpeg-transcoders.ps1") {
    & "$PSScriptRoot\start-ffmpeg-transcoders.ps1" | Out-Null
    # Warm-up: wait a bit for publishers to attach so the first HLS request doesn't 404.
    $ffmpegPidPath = "$PSScriptRoot\ffmpeg-transcoders.pid"
    $mediamtxLogPath = "$PSScriptRoot\mediamtx.log"
    if ((Test-Path $ffmpegPidPath) -and (Test-Path $mediamtxLogPath)) {
      try {
        $state = Get-Content $ffmpegPidPath -Raw | ConvertFrom-Json
        $publishPaths = @($state.processes | ForEach-Object { $_.publishPath } | Where-Object { $_ })
        if ($publishPaths.Count -gt 0) {
          Write-Host "Waiting for transcoders to publish into MediaMTX..." -ForegroundColor DarkGray
          $deadline = (Get-Date).AddSeconds(30)
          while ((Get-Date) -lt $deadline) {
            $allReady = $true
            foreach ($p in $publishPaths) {
              $pattern = "is publishing to path '$p'"
              if (-not (Select-String -Path $mediamtxLogPath -Pattern $pattern -SimpleMatch -Quiet -ErrorAction SilentlyContinue)) {
                $allReady = $false
                break
              }
            }
            if ($allReady) {
              Write-Host "Transcoders are publishing. HLS should be ready." -ForegroundColor Cyan
              break
            }
            Start-Sleep -Seconds 2
          }
        }
      } catch {
        # ignore warm-up errors
      }
    }
  } else {
    Write-Host "Missing start-ffmpeg-transcoders.ps1; skipping transcoders." -ForegroundColor Yellow
  }
}

Write-Host "Running. Tail logs: streaming\\mediamtx.log and streaming\\logs\\*.ffmpeg.*.log" -ForegroundColor DarkGray
Write-Host "WebRTC (WHEP) URL example: http://localhost:8889/kesanapalli-01-h264/whep" -ForegroundColor DarkGray

try {
  while ($true) { Start-Sleep -Seconds 2 }
} finally {
  & "$PSScriptRoot\stop-mediamtx.ps1" | Out-Null
  Write-Host "Stopped." -ForegroundColor Cyan
}
