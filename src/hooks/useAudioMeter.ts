// Import React hooks
import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Custom hook that calculates RMS level (0..1) based on time-domain waveform of microphone stream
 *
 * Key features:
 * - Configures AnalyserNode internally and polls in real-time with requestAnimationFrame
 * - Provides basic analysis parameters like smoothing, fftSize for audio analysis quality control
 * - Safely cleans up on stream/context changes or component unmount to prevent memory leaks
 * - Accurate audio level measurement based on RMS (Root Mean Square)
 */
export function useAudioMeter(params: {
  audioContext: AudioContext | null // Web Audio API 컨텍스트
  stream: MediaStream | null // 마이크에서 받아오는 미디어 스트림
  smoothing?: number // 시간 도메인 데이터의 스무딩 계수 (기본값: 0.8)
  fftSize?: number // FFT 크기 (기본값: 2048)
}) {
  // Extract values from parameters and set defaults
  const { audioContext, stream, smoothing = 0.8, fftSize = 2048 } = params

  // State to store audio level (RMS value between 0..1)
  const [level, setLevel] = useState(0)

  // Ref to store MediaStreamAudioSourceNode reference
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  // Ref to store AnalyserNode reference
  const analyserRef = useRef<AnalyserNode | null>(null)
  // Ref to store requestAnimationFrame ID
  const rafRef = useRef<number | null>(null)

  /**
   * Memoize function to clean up audio analysis related resources
   * Initializes requestAnimationFrame, audio node connections, and state
   */
  const cleanup = useMemo(() => {
    return () => {
      // Cancel running requestAnimationFrame
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null

      // Disconnect audio nodes
      if (analyserRef.current) analyserRef.current.disconnect()
      if (sourceRef.current) sourceRef.current.disconnect()

      // Initialize references
      analyserRef.current = null
      sourceRef.current = null

      // Initialize audio level to 0
      setLevel(0)
    }
  }, [])

  useEffect(() => {
    // Do nothing if audioContext or stream is not available
    if (!audioContext || !stream) return

    // Clean up existing resources
    cleanup()

    // Create MediaStreamAudioSourceNode to connect microphone stream to audio context
    const source = audioContext.createMediaStreamSource(stream)

    // Create AnalyserNode to analyze audio data
    const analyser = audioContext.createAnalyser()

    // Set analysis parameters
    analyser.smoothingTimeConstant = smoothing // Smoothing coefficient for time domain data
    analyser.fftSize = fftSize // Set FFT size

    // Connect source and analyzer
    source.connect(analyser)

    // Store references
    sourceRef.current = source
    analyserRef.current = analyser

    // Get buffer size needed for analysis
    const bufferLength = analyser.frequencyBinCount
    // Create array to store time domain data
    const data = new Uint8Array(bufferLength)

    /**
     * Function to calculate audio level
     * Measures audio level in real-time using requestAnimationFrame
     */
    const tick = () => {
      // Get time domain data (waveform data)
      analyser.getByteTimeDomainData(data)

      // Initialize variable for RMS (Root Mean Square) calculation
      let sumSquares = 0

      // Perform RMS calculation for each sample
      for (let i = 0; i < data.length; i++) {
        // Normalize 0-255 range values to -1~1 range
        const v = (data[i] - 128) / 128
        // Calculate sum of squares
        sumSquares += v * v
      }

      // Calculate RMS value (square root of mean of squares)
      const rms = Math.sqrt(sumSquares / data.length)

      // Amplify RMS value to increase sensitivity (limited to max 1.0)
      // const amplifiedLevel = Math.min(rms * 3, 1.0)

      // Store calculated level in state
      setLevel(rms)

      // Schedule requestAnimationFrame to run again in next frame
      rafRef.current = requestAnimationFrame(tick)
    }

    // Start first frame
    rafRef.current = requestAnimationFrame(tick)

    // Return cleanup function to run when dependencies change or component unmounts
    return cleanup
  }, [audioContext, stream, smoothing, fftSize, cleanup])

  // Return calculated audio level
  return { level }
}
