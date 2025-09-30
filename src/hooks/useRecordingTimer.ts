// Import React hooks
import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for tracking recording progress time
 *
 * Key features:
 * - Automatically starts/stops timer based on recording start/stop
 * - Supports pause/resume functionality for accurate recording time tracking
 * - Formats time in HH:MM:SS format for user display
 * - Safely cleans up timer on component unmount
 */
export function useRecordingTimer(
  isRecording: boolean, // Whether currently recording
  isPaused: boolean = false // Whether recording is paused
) {
  // State to store elapsed time in seconds
  const [elapsedTime, setElapsedTime] = useState(0)
  // Ref to store setInterval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  // Ref to store recording start time (Date.now() value)
  const startTimeRef = useRef<number | null>(null)
  // Ref to store total paused time (in milliseconds)
  const pausedTimeRef = useRef<number>(0)
  // Ref to store pause start time
  const pauseStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRecording && !isPaused) {
      // Recording start or resume state
      if (startTimeRef.current === null) {
        // First time starting recording: set current time as start time
        startTimeRef.current = Date.now()
      } else if (pauseStartTimeRef.current !== null) {
        // Resuming from pause: accumulate paused time
        const pauseDuration = Date.now() - pauseStartTimeRef.current
        pausedTimeRef.current += pauseDuration
        pauseStartTimeRef.current = null // Initialize pause start time
      }

      // Set interval to update elapsed time every 100ms
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          // Calculate actual recording time by subtracting start time from current time and subtracting paused time (in seconds)
          const totalElapsed = Date.now() - startTimeRef.current
          const actualElapsed = Math.floor(
            (totalElapsed - pausedTimeRef.current) / 1000
          )
          setElapsedTime(actualElapsed)
        }
      }, 100) // Update every 100ms for smooth time display
    } else if (isPaused) {
      // Paused state: clean up interval and record pause start time
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // Record pause start time (current time)
      if (pauseStartTimeRef.current === null) {
        pauseStartTimeRef.current = Date.now()
      }
    } else {
      // Recording stopped state: clean up interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // cleanup function: clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRecording, isPaused]) // runs whenever recording state or pause state changes

  /**
   * Function to format time in seconds to HH:MM:SS format string
   * @param seconds - Time to format (in seconds)
   * @returns Time string in HH:MM:SS format
   */
  const formatTime = (seconds: number): string => {
    // Calculate hours, minutes, seconds
    const hours = Math.floor(seconds / 3600) // 3600 seconds = 1 hour
    const mins = Math.floor((seconds % 3600) / 60) // Calculate minutes from remaining time
    const secs = seconds % 60 // Calculate seconds from remaining time

    // Format each value as 2-digit string and connect with colons
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Function to reset timer
   * Sets elapsed time to 0 and initializes all references
   */
  const reset = () => {
    setElapsedTime(0)
    startTimeRef.current = null
    pausedTimeRef.current = 0
    pauseStartTimeRef.current = null
  }

  // Return timer-related states and functions
  return {
    elapsedTime, // Elapsed time (in seconds)
    formattedTime: formatTime(elapsedTime), // Formatted time string (HH:MM:SS)
    reset, // Function to reset timer
  }
}
