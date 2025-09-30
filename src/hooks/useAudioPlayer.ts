// Import React hooks
import { useRef, useState, useCallback } from 'react'

// Return type definition for useAudioPlayer hook
interface UseAudioPlayerReturn {
  isPlaying: boolean // Whether currently playing
  audioRef: React.RefObject<HTMLAudioElement | null> // Audio element reference
  playPause: () => void // Play/pause toggle function
  resetPlayer: () => void // Player state reset function
  handleAudioEnded: () => void // Playback completion handler
}

/**
 * Custom hook for managing audio playback
 *
 * Key features:
 * - Manages play/pause state of audio files
 * - Provides HTML Audio element reference
 * - Automatic pause handling on playback completion
 * - Player state reset functionality
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  // State to store audio playback status
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  // Ref to store HTML Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null)

  /**
   * Function to play/pause audio
   * Performs play or pause based on current playback state
   */
  const playPause = useCallback(() => {
    // Do nothing if audio element doesn't exist
    if (!audioRef.current) return

    if (isPlaying) {
      // Pause if currently playing
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Play if paused
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying]) // Function is recreated whenever isPlaying state changes

  /**
   * Function called when audio playback ends
   * Automatically changes to pause state on playback completion
   */
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
  }, []) // Empty dependency array to prevent function recreation

  /**
   * Function to reset player state
   * Called when starting new recording to initialize previous playback state
   */
  const resetPlayer = useCallback(() => {
    // Pause if currently playing
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }, [isPlaying]) // Function is recreated whenever isPlaying state changes

  // Set event listener on audio element
  // This should be set as onEnded={handleAudioEnded} when using audioRef in component

  // Return player-related states and functions
  return {
    isPlaying, // Whether currently playing
    audioRef, // HTML Audio element reference
    playPause, // Play/pause toggle function
    resetPlayer, // Player state reset function
    handleAudioEnded, // Playback completion handler (used in component)
  }
}
