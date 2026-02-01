import { useRef, useState, useCallback, useEffect } from 'react'

export interface UseVideoRecorderOptions {
  maxDurationMs?: number
  videoRef: React.RefObject<HTMLVideoElement | null>
  videoBitsPerSecond?: number
}

export interface RecorderState {
  isRecording: boolean
  isPaused: boolean
  duration: number // in seconds
  recordedBlob: Blob | null
  error: string | null
}

export function useVideoRecorder({ maxDurationMs = 10 * 60 * 1000, videoRef, videoBitsPerSecond }: UseVideoRecorderOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  const isRecordingRef = useRef<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    recordedBlob: null,
    error: null,
  })

  // Update duration every 100ms
  useEffect(() => {
    if (!state.isRecording || state.isPaused) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current
      const seconds = Math.floor(elapsed / 1000)
      setState((prev) => ({ ...prev, duration: seconds }))

      // Auto-stop if max duration reached
      if (elapsed >= maxDurationMs) {
        // Trigger stop
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop()
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [state.isRecording, state.isPaused, maxDurationMs])

  // Continuous frame drawing loop - runs while recording
  useEffect(() => {
    if (!state.isRecording || state.isPaused) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = ctxRef.current

    if (!video || !canvas || !ctx) return

    const drawFrame = () => {
      // Only draw if recording and not paused
      if (isRecordingRef.current && !state.isPaused) {
        // Check if video has data to draw
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          try {
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          } catch (e) {
            console.error('Error drawing frame:', e)
          }
        }
        animationFrameRef.current = requestAnimationFrame(drawFrame)
      }
    }

    animationFrameRef.current = requestAnimationFrame(drawFrame)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [state.isRecording, state.isPaused, videoRef])

  const startRecording = useCallback(async () => {
    try {
      const video = videoRef.current
      if (!video) {
        setState((prev) => ({ ...prev, error: 'Video element not found' }))
        return
      }

      // Check if video is actually playing
      if (video.paused) {
        setState((prev) => ({ ...prev, error: 'Video is paused. Click Play on the video first, then start recording.' }))
        return
      }

      // Wait for video to have data
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        setState((prev) => ({ ...prev, error: 'Video stream not ready. Please wait for the video to load.' }))
        return
      }

      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setState((prev) => ({ ...prev, error: 'Video has no valid dimensions. Ensure the stream is working.' }))
        return
      }

      // Additional check: ensure video is actually rendering frames
      if (video.currentTime === 0 && video.readyState === video.HAVE_NOTHING) {
        setState((prev) => ({ ...prev, error: 'Video stream not loaded. Check if the camera stream is working.' }))
        return
      }

      // Get canvas to capture video stream
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth > 0 ? video.videoWidth : 1280
      canvas.height = video.videoHeight > 0 ? video.videoHeight : 720

      canvasRef.current = canvas

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        setState((prev) => ({ ...prev, error: 'Could not get canvas context' }))
        return
      }

      ctxRef.current = ctx

      // Capture canvas stream at 30 FPS
      const canvasStream = canvas.captureStream(30)
      if (!canvasStream || canvasStream.getVideoTracks().length === 0) {
        setState((prev) => ({ ...prev, error: 'Could not capture canvas stream' }))
        return
      }

      // Try to get audio from video element or use silent audio
      let audioTracks: MediaStreamTrack[] = []
      try {
        const AudioContextClass =
          (window as unknown as Record<string, unknown>).AudioContext ||
          (window as unknown as Record<string, unknown>).webkitAudioContext
        if (AudioContextClass) {
          const audioContext = new (AudioContextClass as typeof AudioContext)()
          const dest = audioContext.createMediaStreamDestination()
          const audioTrack = dest.stream.getAudioTracks()[0]
          if (audioTrack) {
            audioTracks = [audioTrack]
          }
        }
      } catch (e) {
        console.log('Could not setup audio:', e)
      }

      // Combine canvas video + audio
      const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks])

      // Create recorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm'

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: videoBitsPerSecond ?? 5000000, // 5 Mbps default
      })

      chunksRef.current = []
      let dataAvailableCount = 0

      recorder.ondataavailable = (e) => {
        dataAvailableCount++
        console.log(`Recording data available (chunk ${dataAvailableCount}): ${e.data.size} bytes`)
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const totalSize = chunksRef.current.reduce((sum, blob) => sum + blob.size, 0)
        console.log(`Recording stopped. Total chunks: ${chunksRef.current.length}, Total size: ${totalSize} bytes`)
        console.log('Chunks:', chunksRef.current.map(c => c.size))

        if (totalSize === 0) {
          console.error('Recording produced no data!')
          setState((prev) => ({
            ...prev,
            recordedBlob: null,
            isRecording: false,
            isPaused: false,
            error: 'Recording captured no data. The video stream may not be working. Check console for WHEP/HLS errors.',
          }))

          combinedStream.getTracks().forEach((track) => {
            track.stop()
          })
          return
        }

        const blob = new Blob(chunksRef.current, { type: mimeType })
        console.log(`Created blob: ${blob.size} bytes, type: ${blob.type}`)
        
        setState((prev) => ({
          ...prev,
          recordedBlob: blob,
          isRecording: false,
          isPaused: false,
          error: null,
        }))

        // Stop all streams
        combinedStream.getTracks().forEach((track) => {
          track.stop()
        })
      }

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e.error)
        setState((prev) => ({ ...prev, error: `Recording error: ${e.error}` }))
      }

      // Set recording flag BEFORE starting recorder
      isRecordingRef.current = true

      // Start the recorder
      recorder.start(1000) // Request data every 1 second

      recorderRef.current = recorder
      streamRef.current = combinedStream
      startTimeRef.current = Date.now()
      pausedTimeRef.current = 0

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        error: null,
        recordedBlob: null,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState((prev) => ({ ...prev, error: `Failed to start recording: ${message}` }))
      isRecordingRef.current = false
    }
  }, [videoRef])

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      isRecordingRef.current = false
      recorderRef.current.pause()
      pausedTimeRef.current += Date.now() - startTimeRef.current
      setState((prev) => ({ ...prev, isPaused: true }))
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      isRecordingRef.current = true
      recorderRef.current.resume()
      startTimeRef.current = Date.now()
      setState((prev) => ({ ...prev, isPaused: false }))
    }
  }, [])

  const stopRecording = useCallback(() => {
    console.log('stopRecording called, current state:', recorderRef.current?.state)
    isRecordingRef.current = false

    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.requestData()
      } catch (e) {
        console.warn('requestData failed:', e)
      }
      recorderRef.current.stop()
      console.log('MediaRecorder.stop() called')
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Don't clear isRecording here - let onstop handler do it
    // setState((prev) => ({ ...prev, isRecording: false, isPaused: false }))
  }, [])

  const downloadRecording = useCallback(() => {
    if (!state.recordedBlob) return

    if (state.recordedBlob.size === 0) {
      setState((prev) => ({ ...prev, error: 'Recording file is empty. Please record again.' }))
      return
    }

    console.log(`Downloading recording: ${state.recordedBlob.size} bytes`)

    const url = URL.createObjectURL(state.recordedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recording-${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [state.recordedBlob])

  const resetRecording = useCallback(() => {
    chunksRef.current = []
    isRecordingRef.current = false
    canvasRef.current = null
    ctxRef.current = null
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      recordedBlob: null,
      error: null,
    })
  }, [])

  return {
    ...state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    downloadRecording,
    resetRecording,
    maxDurationMs,
    remainingTime: Math.max(0, Math.floor((maxDurationMs - state.duration * 1000) / 1000)),
  }
}
