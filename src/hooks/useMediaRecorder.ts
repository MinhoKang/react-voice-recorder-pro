// Import React hooks
import { useCallback, useEffect, useRef, useState } from 'react'

// Type definition representing MediaRecorder state
type RecorderState = {
  isRecording: boolean // Whether currently recording
  isPaused: boolean // Whether recording is paused
  chunks: Blob[] // Recorded audio data chunks
  mimeType: string // MIME type of recorded file
  start: () => void // Function to start recording
  pause: () => void // Function to pause recording
  resume: () => void // Function to resume recording
  stop: () => Promise<Blob | null> // Function to stop recording and return Blob
  reset: () => void // Function to reset recording state
  error: string | null // Recording-related error message
}

/**
 * Custom hook for audio recording based on MediaRecorder API
 *
 * Key features:
 * - Provides start/stop/pause/resume recording functionality
 * - Collects audio data chunks through dataavailable events
 * - Creates final audio file in Blob format
 * - Automatically cleans up previous recorder when stream changes to prevent memory leaks
 * - Error handling and state management
 */
export function useMediaRecorder(
  stream: MediaStream | null, // Media stream to record
  options?: MediaRecorderOptions // MediaRecorder options (MIME type etc.)
): RecorderState {
  // States to store recording status
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [chunks, setChunks] = useState<Blob[]>([]) // Recorded audio data chunks
  const [error, setError] = useState<string | null>(null) // Error message

  // Ref to store MediaRecorder instance reference
  const recorderRef = useRef<MediaRecorder | null>(null)

  // Set MIME type (default: 'audio/webm')
  const mimeType = options?.mimeType || 'audio/webm'

  useEffect(() => {
    // Set recorder to null and exit if no stream
    if (!stream) {
      recorderRef.current = null
      return
    }

    try {
      // Create MediaRecorder instance
      const rec = new MediaRecorder(stream, { mimeType })

      // dataavailable event listener: receives recorded audio data chunks
      rec.ondataavailable = (e: BlobEvent) => {
        // Add to chunk array if data exists and size is greater than 0
        if (e.data && e.data.size > 0) setChunks((prev) => [...prev, e.data])
      }

      // start event listener: synchronizes state when recording starts
      rec.onstart = () => {
        setIsRecording(true)
      }

      // pause event listener: synchronizes state when recording is paused
      rec.onpause = () => {
        setIsPaused(true)
      }

      // resume event listener: synchronizes state when recording is resumed
      rec.onresume = () => {
        setIsPaused(false)
      }

      // stop event listener: synchronizes state when recording stops
      rec.onstop = () => {
        setIsRecording(false)
        setIsPaused(false)
      }

      // error event listener: handles errors that occur during recording
      rec.onerror = (e: Event) => {
        const target = e.target as MediaRecorder | null
        // Set error message (currently using default message)
        const message =
          target && (target as MediaRecorder).mimeType
            ? 'Recording error'
            : 'Recording error'
        setError(message)
      }

      // Store recorder reference
      recorderRef.current = rec
    } catch (err) {
      // Set error message when MediaRecorder creation fails
      setError(err instanceof Error ? err.message : 'MediaRecorder creation failed')
      recorderRef.current = null
    }

    // cleanup function: runs when stream changes or component unmounts
    return () => {
      const r = recorderRef.current
      // Stop if recorder is in active state
      if (r && r.state !== 'inactive') r.stop()
      recorderRef.current = null
    }
  }, [stream, mimeType]) // runs whenever stream or mimeType changes

  /**
   * Function to start recording
   * Initializes errors, clears chunk array, then starts recording
   */
  const start = useCallback(() => {
    // Initialize previous error message
    setError(null)
    // Initialize previous recording chunks
    setChunks([])
    // Release pause state
    setIsPaused(false)

    const r = recorderRef.current
    if (!r) return

    // Only start recording when recorder is in inactive state
    if (r.state === 'inactive') {
      try {
        // Set to collect data at 100ms intervals and start recording
        r.start(100)
      } catch (error) {
        setError('Recording start failed')
      }
    }
  }, [])

  /**
   * Function to pause recording
   * Only pauses when recorder is recording
   */
  const pause = useCallback(() => {
    const r = recorderRef.current
    if (!r) return

    // Only pause when recorder is recording
    if (r.state === 'recording') {
      r.pause()
    }
  }, [])

  /**
   * Function to resume recording
   * Only resumes when recorder is in paused state
   */
  const resume = useCallback(() => {
    const r = recorderRef.current
    if (!r) return

    // Only resume when recorder is in paused state
    if (r.state === 'paused') {
      r.resume()
      // setIsPaused(false) removed - handled in onresume event
    }
  }, [])

  /**
   * Function to stop recording and return Blob
   * Returns Promise for asynchronous processing
   */
  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const r = recorderRef.current
      if (!r) return resolve(null)

      // Only stop when recorder is not in inactive state
      if (r.state !== 'inactive') {
        // Set stop event listener
        r.onstop = () => {
          // Create Blob from collected chunks
          const blob = new Blob(chunks, { type: mimeType })
          resolve(blob)
          // State initialization is handled in MediaRecorder's onstop event
        }
        // Stop recording
        r.stop()
      } else {
        // Return null if already in inactive state
        resolve(null)
      }
    })
  }, [chunks, mimeType]) // Function is recreated whenever chunks or mimeType changes

  /**
   * Function to reset recording state
   * Clears chunk array and releases pause state
   */
  const reset = useCallback(() => {
    setChunks([])
    setIsPaused(false)
  }, []) // Empty dependency array to prevent function recreation

  // Return MediaRecorder state and control functions
  return {
    isRecording, // Whether currently recording
    isPaused, // Whether recording is paused
    chunks, // Recorded audio data chunks
    mimeType, // MIME type of recorded file
    start, // Function to start recording
    pause, // Function to pause recording
    resume, // Function to resume recording
    stop, // Function to stop recording and return Blob
    reset, // Function to reset recording state
    error, // Recording-related error message
  }
}
