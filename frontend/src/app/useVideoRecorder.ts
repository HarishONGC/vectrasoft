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

    let frameCount = 0
    let lastLogTime = Date.now()
    let errorCount = 0

    const drawFrame = () => {
      // Only draw if recording and not paused
      if (isRecordingRef.current && !state.isPaused) {
        // Check if video has data to draw
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          try {
            // Ensure canvas is cleared
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Draw video frame - this is critical
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            frameCount++

            // Log every second
            const now = Date.now()
            if (now - lastLogTime >= 1000) {
              console.log(`Drawing frames: ${frameCount} frames in last second`)
              frameCount = 0
              lastLogTime = now
            }
          } catch (e) {
            errorCount++
            if (errorCount <= 5) {
              // Only log first 5 errors to avoid spam
              console.error(`Error drawing frame (${errorCount}):`, e)
            }
          }
        } else {
          // Log if video isn't ready
          const now = Date.now()
          if (now - lastLogTime >= 2000) {
            console.warn(`Video not ready for capture. readyState=${video.readyState}, videoWidth=${video.videoWidth}, videoHeight=${video.videoHeight}, paused=${video.paused}`)
            lastLogTime = now
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
      if (typeof MediaRecorder === 'undefined') {
        setState((prev) => ({
          ...prev,
          error: 'Recording is not supported in this browser. Try Chrome or Edge.',
        }))
        return
      }

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

      console.log(`Canvas created: ${canvas.width}x${canvas.height}`)

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
        console.error('Canvas capture failed. Video tracks:', canvasStream?.getVideoTracks().length)
        setState((prev) => ({ ...prev, error: 'Could not capture canvas stream' }))
        return
      }

      console.log(`Canvas stream created with ${canvasStream.getVideoTracks().length} video track(s)`)

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

      const supportedTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      const mimeType = supportedTypes.find((type) => MediaRecorder.isTypeSupported(type))

      const recorder = new MediaRecorder(combinedStream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: videoBitsPerSecond ?? 5000000, // 5 Mbps default
      })

      chunksRef.current = []
      let dataAvailableCount = 0

      recorder.ondataavailable = (e) => {
        dataAvailableCount++
        if (e.data.size > 0) {
          console.log(`Recording data available (chunk ${dataAvailableCount}): ${e.data.size} bytes`)
          chunksRef.current.push(e.data)
        } else {
          console.warn(`Empty chunk received (${dataAvailableCount})`)
        }
      }

      const finalizeRecording = () => {
        const totalSize = chunksRef.current.reduce((sum, blob) => sum + blob.size, 0)
        console.log(`Recording stopped. Total chunks: ${chunksRef.current.length}, Total size: ${totalSize} bytes`)
        console.log('Chunks:', chunksRef.current.map((c) => c.size))

        // Always create a blob, even if empty, so the download button appears
        const blob = new Blob(chunksRef.current, { type: mimeType ?? 'video/webm' })
        console.log(`Created blob: ${blob.size} bytes, type: ${blob.type}`)

        if (totalSize === 0) {
          console.error('Recording produced no data!')
          setState((prev) => ({
            ...prev,
            recordedBlob: blob, // Still set the blob so download button appears
            isRecording: false,
            isPaused: false,
            error: 'Recording captured no data. Canvas frames were not drawn. This usually means the video element cannot be captured due to CORS or codec issues. Try recording from a different stream.',
          }))
        } else {
          setState((prev) => ({
            ...prev,
            recordedBlob: blob,
            isRecording: false,
            isPaused: false,
            error: null,
          }))
        }

        // Stop all streams
        combinedStream.getTracks().forEach((track) => {
          track.stop()
        })
      }

      recorder.onstop = () => {
        // Allow any pending dataavailable event to enqueue its chunk first.
        window.setTimeout(finalizeRecording, 50)
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
  }, [videoRef, videoBitsPerSecond])

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
        // Request any pending data before stopping
        recorderRef.current.requestData()
        console.log('requestData() called')
      } catch (e) {
        console.warn('requestData failed:', e)
      }
      
      // Small delay to allow final data event to process
      window.setTimeout(() => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop()
          console.log('MediaRecorder.stop() called')
        }
      }, 50)
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Don't clear isRecording here - let onstop handler do it
    // setState((prev) => ({ ...prev, isRecording: false, isPaused: false }))
  }, [])

  const downloadRecording = useCallback((cameraName?: string) => {
    if (!state.recordedBlob) {
      setState((prev) => ({ ...prev, error: 'No recording available to download' }))
      return
    }

    if (state.recordedBlob.size === 0) {
      setState((prev) => ({
        ...prev,
        error: 'Recording file is empty (0 bytes). The video stream may not have been captured. Ensure HLS/WHEP is playing before recording.',
      }))
      return
    }

    console.log(`Downloading recording: ${state.recordedBlob.size} bytes`)

    try {
      const safeName = cameraName ? cameraName.replace(/[^a-z0-9\-_. ]/gi, '_').trim() : 'camera'
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0] // YYYY-MM-DDTHH-MM-SS
      const filename = `${safeName}-recording-${timestamp}.webm`

      const url = URL.createObjectURL(state.recordedBlob)
      console.log(`Created object URL: ${url}, size: ${state.recordedBlob.size}`)

      // Create anchor element
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.style.display = 'none'

      // Append to body
      document.body.appendChild(anchor)

      // Try to trigger download
      try {
        anchor.click()
        console.log('Download triggered via anchor.click()')
      } catch (clickErr) {
        console.warn('anchor.click() failed, trying alternative method:', clickErr)
        // Fallback: open in new tab
        window.open(url, '_blank')
      }

      // Clean up after giving the browser time to process
      setTimeout(() => {
        try {
          document.body.removeChild(anchor)
          URL.revokeObjectURL(url)
          console.log('Cleaned up download resources')
        } catch (cleanupErr) {
          console.warn('Cleanup error:', cleanupErr)
        }
      }, 100)
    } catch (err) {
      console.error('Download failed:', err)
      setState((prev) => ({
        ...prev,
        error: `Download failed: ${err instanceof Error ? err.message : String(err)}`,
      }))
    }
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
