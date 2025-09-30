// Import React hooks
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Reusable custom hook for safely controlling microphone input
 *
 * Key features:
 * - Real-time tracking of microphone permission state (in browsers supporting Permissions API)
 * - Manages microphone stream activation/deactivation
 * - Safely manages media track lifecycle to prevent memory leaks
 * - Standardizes browser-specific error messages to user-friendly messages
 * - Provides graceful fallback for browsers without Permissions API
 */

// Type definition for Navigator supporting Permissions API
type NavigatorWithPermissions = Navigator & { permissions?: Permissions }

// Type definition representing microphone state
type MicrophoneState = {
  stream: MediaStream | null // Media stream from microphone
  isEnabled: boolean // Whether microphone is currently enabled
  permission: PermissionState | 'prompt' | 'unknown' // Microphone permission state
  error: string | null // Microphone-related error message
  enable: () => Promise<void> // Function to enable microphone
  disable: () => void // Function to disable microphone
}

export function useMicrophone(): MicrophoneState {
  // State to store media stream from microphone
  const [stream, setStream] = useState<MediaStream | null>(null)
  // State to store whether microphone is currently enabled
  const [isEnabled, setIsEnabled] = useState(false)
  // State to store microphone permission state ('granted', 'denied', 'prompt', 'unknown')
  const [permission, setPermission] = useState<
    PermissionState | 'prompt' | 'unknown'
  >('unknown')
  // State to store microphone-related error message
  const [error, setError] = useState<string | null>(null)
  // Ref to store stream reference (used for cleanup)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    /**
     * useEffect to track microphone permission state
     * If Permissions API is available, tracks current microphone permission state in real-time.
     * Some browsers (especially iOS Safari) don't have Permissions API, so fallback is used.
     */
    let mounted = true // Flag to track if component is mounted
    const nav = navigator as NavigatorWithPermissions

    // Check if browser supports Permissions API
    if (nav.permissions?.query) {
      // Query microphone permission state
      nav.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((status) => {
          // Don't update state if component is unmounted
          if (!mounted) return
          // Set current permission state
          setPermission(status.state)
          // Register listener to update state whenever permission state changes
          status.onchange = () => setPermission(status.state)
        })
        .catch(() => setPermission('unknown')) // Set to 'unknown' on error
    } else {
      // Set to 'prompt' for browsers that don't support Permissions API
      setPermission('prompt')
    }

    // cleanup function: set mounted flag to false on component unmount
    return () => {
      mounted = false
    }
  }, []) // Empty dependency array to run only once on component mount

  /**
   * Function to enable microphone
   * Requests microphone stream and updates state on success.
   * Enables basic audio processing options to mitigate noise/echo.
   * If existing stream exists, cleans it up first to ensure popup appears again on re-request.
   */
  const enable = useCallback(async () => {
    try {
      // Initialize previous error message
      setError(null)

      // Clean up existing stream first if it exists
      // Prevents issues on re-request depending on browser
      if (streamRef.current) {
        // Stop all media tracks
        streamRef.current.getTracks().forEach((t) => t.stop())
        // Initialize reference and state
        streamRef.current = null
        setStream(null)
        setIsEnabled(false)
      }

      // Request microphone stream
      // Apply settings for improved audio quality and increased sensitivity
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true, // Enable echo cancellation
          noiseSuppression: true, // Enable noise suppression
          autoGainControl: true, // Enable automatic gain control
          sampleRate: 44100, // Set high sample rate
          channelCount: 1, // Mono channel
        },
      })

      // Update state when stream is successfully received
      streamRef.current = nextStream
      setStream(nextStream)
      setIsEnabled(true)
    } catch (err) {
      // Convert browser-specific errors to user-friendly messages
      let message = 'Microphone permission or device error'

      if (err && typeof err === 'object') {
        const e = err as DOMException & { name?: string }

        // Set appropriate message based on error type
        if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
          message =
            'Permission denied. Please allow microphone in browser site settings.'
        } else if (e.name === 'NotFoundError') {
          message = 'Microphone device not found.'
        } else if (e.name === 'NotReadableError') {
          message = 'Another app is using the microphone or it is not accessible.'
        }
      }

      // Set error message and disable microphone
      setError(message)
      setIsEnabled(false)
    }
  }, []) // Empty dependency array to prevent function recreation

  /**
   * Function to disable microphone
   * Releases microphone by stopping all tracks of currently acquired stream.
   */
  const disable = useCallback(() => {
    // Get current stream reference
    const current = streamRef.current
    if (current) {
      // Stop all media tracks
      current.getTracks().forEach((t) => t.stop())
    }
    // Initialize reference and state
    streamRef.current = null
    setStream(null)
    setIsEnabled(false)
  }, []) // Empty dependency array to prevent function recreation

  useEffect(() => {
    /**
     * useEffect to safely clean up if microphone is on when component unmounts
     * Stops all media tracks to prevent memory leaks.
     */
    return () => {
      const current = streamRef.current
      if (current) current.getTracks().forEach((t) => t.stop())
    }
  }, []) // Empty dependency array to run only on component unmount

  // Return microphone state and control functions
  return { stream, isEnabled, permission, error, enable, disable }
}
