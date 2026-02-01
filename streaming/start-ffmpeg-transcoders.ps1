param(
  [string]$FfmpegPath = "",
  [string]$PidPath = "$PSScriptRoot\ffmpeg-transcoders.pid",
  [string]$LogDir = "$PSScriptRoot\logs"
)

$ErrorActionPreference = 'Stop'

function Resolve-FfmpegExe {
  param([string]$Hint)
  if ($Hint -and (Test-Path $Hint)) {
    return (Resolve-Path $Hint).Path
  }
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source) {
    return $cmd.Source
  }
  return $null
}

$ffmpegExe = Resolve-FfmpegExe -Hint $FfmpegPath
if (-not $ffmpegExe) {
  Write-Host 'ffmpeg was not found.' -ForegroundColor Red
  Write-Host 'Install it (recommended): winget install Gyan.FFmpeg' -ForegroundColor Yellow
  Write-Host 'Or pass -FfmpegPath to this script.' -ForegroundColor Yellow
  exit 1
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# Stop previous transcoders (if any)
if (Test-Path $PidPath) {
  try {
    $state = Get-Content $PidPath -Raw | ConvertFrom-Json
    foreach ($p in @($state.processes)) {
      if ($p -and $p.pid) {
        $proc = Get-Process -Id ([int]$p.pid) -ErrorAction SilentlyContinue
        if ($proc) { Stop-Process -Id $proc.Id -Force }
      }
    }
  } catch {}
  Remove-Item $PidPath -Force -ErrorAction SilentlyContinue
}

$targets = @(
  # Pull from local MediaMTX instead of the cameras directly. The camera SDP advertises
  # both H265 and H264 and ffmpeg can end up selecting the H264 payload, which fails
  # to decode due to unsupported H264 data partitioning. MediaMTX re-advertises a clean
  # HEVC-only stream for these paths.
  @{ name = 'kesanapalli-01'; source = 'rtsp://localhost:8554/kesanapalli-01'; publishPath = 'kesanapalli-01-h264' },
  @{ name = 'kesanapalli-04'; source = 'rtsp://localhost:8554/kesanapalli-04'; publishPath = 'kesanapalli-04-h264' }
)

$procs = @()
foreach ($t in $targets) {
  $outUrl = "rtsp://localhost:8554/$($t.publishPath)"
  $stdout = Join-Path $LogDir "$($t.name).ffmpeg.out.log"
  $stderr = Join-Path $LogDir "$($t.name).ffmpeg.err.log"

  $args = @(
    '-hide_banner',
    '-loglevel', 'info',
    '-nostdin',
    # Input options must come before -i.
    '-rtsp_flags', 'prefer_tcp',
    '-rtsp_transport', 'tcp',
    '-timeout', '10000000',
    '-i', $t.source,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-pix_fmt', 'yuv420p',
    '-g', '50',
    '-keyint_min', '50',
    '-sc_threshold', '0',
    '-f', 'rtsp',
    '-rtsp_transport', 'tcp',
    $outUrl
  )

  try { Remove-Item $stdout -Force -ErrorAction SilentlyContinue } catch {}
  try { Remove-Item $stderr -Force -ErrorAction SilentlyContinue } catch {}

  $p = Start-Process -FilePath $ffmpegExe -ArgumentList $args -WorkingDirectory $PSScriptRoot -WindowStyle Minimized -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
  $procs += [pscustomobject]@{ name = $t.name; pid = $p.Id; publishPath = $t.publishPath; outUrl = $outUrl; outLog = $stdout; errLog = $stderr }
}

@{
  startedAt = (Get-Date).ToString('o')
  ffmpeg = $ffmpegExe
  processes = $procs
} | ConvertTo-Json -Depth 5 | Set-Content -Path $PidPath -Encoding UTF8

Write-Host 'FFmpeg transcoders started.' -ForegroundColor Cyan
foreach ($p in $procs) {
  Write-Host "- $($p.name) -> $($p.outUrl) (PID $($p.pid))" -ForegroundColor Cyan
  Write-Host "  out: $($p.outLog)" -ForegroundColor DarkGray
  Write-Host "  err: $($p.errLog)" -ForegroundColor DarkGray
}
Write-Host ''
Write-Host 'HLS should be available at:' -ForegroundColor Cyan
Write-Host '  http://localhost:8888/kesanapalli-01-h264/index.m3u8' -ForegroundColor Cyan
Write-Host '  http://localhost:8888/kesanapalli-04-h264/index.m3u8' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Stop with: ./stop-ffmpeg-transcoders.ps1' -ForegroundColor DarkGray
