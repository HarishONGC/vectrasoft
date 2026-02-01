import { Circle, Pause, Play, Download, RotateCcw } from 'lucide-react'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { cn } from '../app/cn'

interface RecordingControlsProps {
  isRecording: boolean
  isPaused: boolean
  duration: number
  remainingTime: number
  recordedBlob: Blob | null
  error: string | null
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onDownload: () => void
  onReset: () => void
  quality?: 'low' | 'medium' | 'high'
  onQualityChange?: (value: 'low' | 'medium' | 'high') => void
  storageUsedPct?: number
}

export function RecordingControls({
  isRecording,
  isPaused,
  duration,
  remainingTime,
  recordedBlob,
  error,
  onStart,
  onPause,
  onResume,
  onStop,
  onDownload,
  onReset,
  quality = 'high',
  onQualityChange,
  storageUsedPct = 0.32,
}: RecordingControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const storagePct = Math.max(0, Math.min(1, storageUsedPct))

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-surface2/50 p-3 ring-1 ring-border/70">
      {error ? (
        <div className="text-xs text-rose-500 font-semibold rounded bg-rose-500/10 px-2 py-1">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording && (
            <Circle size={8} className="fill-rose-500 text-rose-500 animate-pulse" />
          )}
          <div className="text-sm font-semibold text-slate-300">
            {!isRecording && !recordedBlob
              ? 'Ready to Record'
              : isRecording
                ? 'Recording'
                : recordedBlob
                  ? 'Recording Complete'
                  : 'Stopped'}
          </div>
        </div>
        <div className="text-xs font-mono text-muted">
          {recordedBlob ? (
            `${(recordedBlob.size / 1024 / 1024).toFixed(1)} MB`
          ) : isRecording ? (
            <>
              <span className={remainingTime <= 60 ? 'text-amber-500' : ''}>
                {formatTime(duration)} / {formatTime(duration + remainingTime)}
              </span>
              <span className="ml-2 text-muted">
                ({remainingTime}s remaining)
              </span>
            </>
          ) : duration > 0 ? (
            `${formatTime(duration)} recorded`
          ) : (
            '0:00'
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Quality</span>
          <Select
            className="h-8 w-28 text-xs"
            value={quality}
            onChange={(e) => onQualityChange?.(e.currentTarget.value as 'low' | 'medium' | 'high')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Storage</span>
            <span>{Math.round(storagePct * 100)}%</span>
          </div>
          <div className="mt-1 h-1 rounded-full bg-slate-700/70">
            <div
              className={cn(
                'h-1 rounded-full transition-all',
                storagePct >= 0.85
                  ? 'bg-rose-500'
                  : storagePct >= 0.65
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              )}
              style={{ width: `${storagePct * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isRecording && !recordedBlob ? (
          <Button
            variant="primary"
            onClick={onStart}
            className="flex-1 text-sm"
            title="Start recording camera stream"
          >
            <Circle size={14} className="fill-current" />
            Start Recording
          </Button>
        ) : isRecording ? (
          <>
            <Button
              variant={isPaused ? 'primary' : 'secondary'}
              onClick={isPaused ? onResume : onPause}
              className="flex-1 text-sm"
              title={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              {isPaused ? (
                <>
                  <Play size={14} />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={14} />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={onStop}
              className="flex-1 text-sm"
              title="Stop recording"
            >
              <Circle size={14} />
              Stop
            </Button>
          </>
        ) : recordedBlob ? (
          <>
            <Button
              variant="primary"
              onClick={onDownload}
              className="flex-1 text-sm"
              title="Download recorded video"
            >
              <Download size={14} />
              Download
            </Button>
            <Button
              variant="secondary"
              onClick={onReset}
              title="Clear recording and start over"
            >
              <RotateCcw size={14} />
            </Button>
          </>
        ) : null}
      </div>

      {duration > 0 && !recordedBlob && (
        <div className="relative h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              remainingTime <= 60
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-emerald-500 to-blue-500'
            )}
            style={{ width: `${(duration / (duration + remainingTime)) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
