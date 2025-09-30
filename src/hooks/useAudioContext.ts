// Import React hooks
import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Custom hook for managing Web Audio API AudioContext lifecycle
 *
 * Key features:
 * - Automatically manages AudioContext creation and cleanup
 * - Real-time tracking of context execution state via statechange events
 * - Provides resume functionality for iOS/Safari user gesture requirements
 * - Supports webkitAudioContext for browser compatibility
 */

export function useAudioContext() {
  // State to store AudioContext object
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  // State to store whether AudioContext is currently running
  const [isRunning, setIsRunning] = useState(false)
  // Ref to store AudioContext reference (used for cleanup)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Type definitions for Safari compatibility
    // Safari may need to use window.webkitAudioContext
    type AudioContextCtor = typeof AudioContext
    type WebkitWindow = Window & { webkitAudioContext?: AudioContextCtor }
    const win = window as WebkitWindow

    // Select AudioContext constructor considering browser compatibility
    // Use standard AudioContext if available, otherwise use webkitAudioContext
    const Ctx: AudioContextCtor = (window.AudioContext ??
      win.webkitAudioContext)!

    // Create AudioContext instance
    const ctx = new Ctx()

    // Store context in ref for cleanup access
    ctxRef.current = ctx
    // Store context in state
    setAudioContext(ctx)
    // Set initial running state
    setIsRunning(ctx.state === 'running')

    // Event listener function to detect context state changes
    const onState = () => setIsRunning(ctx.state === 'running')

    // Register statechange event listener
    ctx.addEventListener('statechange', onState)

    // Cleanup function: runs when component unmounts or dependencies change
    return () => {
      // Remove event listener
      ctx.removeEventListener('statechange', onState)
      // Safely close AudioContext (ignore errors)
      ctx.close().catch(() => {})
    }
  }, []) // Empty dependency array to run only once on component mount

  // Memoize function to resume AudioContext
  const resume = useMemo(() => {
    return async () => {
      // Do nothing if context doesn't exist
      if (!ctxRef.current) return
      // Only call resume if context is not running
      if (ctxRef.current.state !== 'running') await ctxRef.current.resume()
    }
  }, [])

  // Return AudioContext object, running state, and resume function
  return { audioContext, isRunning, resume }
}
