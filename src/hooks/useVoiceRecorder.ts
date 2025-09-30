import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudioContext } from './useAudioContext';
import { useAudioMeter } from './useAudioMeter';
import { useAudioPlayer } from './useAudioPlayer';
import { useMediaRecorder } from './useMediaRecorder';
import { useMicrophone } from './useMicrophone';
import { useRecordingTimer } from './useRecordingTimer';

// Recording options type definition
export interface VoiceRecorderOptions {
  /** MIME type of recorded file (default: 'audio/webm') */
  mimeType?: string;
  /** Smoothing coefficient for audio level measurement (default: 0.8) */
  smoothing?: number;
  /** FFT size (default: 2048) */
  fftSize?: number;
  /** Whether to automatically enable microphone (default: false) */
  autoEnableMicrophone?: boolean;
  /** Whether to automatically play after recording (default: false) */
  autoPlayAfterRecording?: boolean;
}

// Recording state type definition
export interface VoiceRecorderState {
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Whether microphone is enabled */
  isMicrophoneEnabled: boolean;
  /** Whether audio is playing */
  isPlaying: boolean;
  /** Microphone permission state */
  permission: PermissionState | 'prompt' | 'unknown';
  /** Current audio level (0-1) */
  audioLevel: number;
  /** Recording elapsed time (seconds) */
  elapsedTime: number;
  /** Formatted recording time (HH:MM:SS) */
  formattedTime: string;
  /** Recorded audio Blob */
  recordedBlob: Blob | null;
  /** Audio URL (for playback) */
  audioUrl: string | null;
  /** Error message */
  error: string | null;
}

// Control functions type definition
export interface VoiceRecorderControls {
  /** Start recording */
  startRecording: () => void;
  /** Pause recording */
  pauseRecording: () => void;
  /** Resume recording */
  resumeRecording: () => void;
  /** Stop recording and return Blob */
  stopRecording: () => Promise<Blob | null>;
  /** Enable microphone */
  enableMicrophone: () => Promise<void>;
  /** Disable microphone */
  disableMicrophone: () => void;
  /** Play/pause recorded audio */
  playPause: () => void;
  /** Reset recording state */
  reset: () => void;
  /** Resume audio context (for iOS/Safari) */
  resumeAudioContext: () => Promise<void>;
}

// Return type definition
export interface UseVoiceRecorderReturn extends VoiceRecorderState, VoiceRecorderControls {
  /** HTML Audio element reference */
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

/**
 * All-in-one custom hook for voice recording
 * 
 * Key features:
 * - Microphone permission management and stream control
 * - Real-time audio level measurement and visualization
 * - Recording start/stop/pause/resume functionality
 * - Recording time tracking and formatting
 * - Recorded audio playback functionality
 * - Error handling and state management
 * - iOS/Safari compatibility support
 */
export function useVoiceRecorder(options: VoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const {
    mimeType = 'audio/webm',
    smoothing = 0.8,
    fftSize = 2048,
    autoEnableMicrophone = false,
    autoPlayAfterRecording = false,
  } = options;

  // Use basic hooks
  const { audioContext, isRunning, resume: resumeAudioContext } = useAudioContext();
  const { stream, isEnabled: isMicrophoneEnabled, permission, error: micError, enable: enableMicrophone, disable: disableMicrophone } = useMicrophone();
  const { level: audioLevel } = useAudioMeter({ audioContext, stream, smoothing, fftSize });
  const { isPlaying, audioRef, playPause, resetPlayer, handleAudioEnded } = useAudioPlayer();
  const { isRecording, isPaused, chunks, error: recorderError, start, pause, resume, stop, reset: resetRecorder } = useMediaRecorder(stream, { mimeType });
  const { elapsedTime, formattedTime, reset: resetTimer } = useRecordingTimer(isRecording, isPaused);

  // Local state
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref for cleaning up previous URL
  const previousUrlRef = useRef<string | null>(null);

  // Integrate error states
  useEffect(() => {
    const combinedError = micError || recorderError || error;
    setError(combinedError);
  }, [micError, recorderError, error]);

  // Auto microphone activation
  useEffect(() => {
    if (autoEnableMicrophone && !isMicrophoneEnabled && permission === 'prompt') {
      enableMicrophone().catch(() => {
        // Error is already set in micError
      });
    }
  }, [autoEnableMicrophone, isMicrophoneEnabled, permission, enableMicrophone]);

  // Auto play after recording
  useEffect(() => {
    if (autoPlayAfterRecording && recordedBlob && !isPlaying) {
      // Play after slight delay (after UI update completion)
      const timer = setTimeout(() => {
        playPause();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoPlayAfterRecording, recordedBlob, isPlaying, playPause]);

  // Audio URL management
  useEffect(() => {
    if (recordedBlob) {
      // Clean up previous URL
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
      
      // Create new URL
      const url = URL.createObjectURL(recordedBlob);
      setAudioUrl(url);
      previousUrlRef.current = url;
    } else {
      // Clean up URL if no Blob
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
      setAudioUrl(null);
    }
  }, [recordedBlob]);

  // Clean up URL on component unmount
  useEffect(() => {
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
    };
  }, []);

  // Recording start function
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Enable microphone if disabled
      if (!isMicrophoneEnabled) {
        await enableMicrophone();
      }
      
      // Resume audio context if not running
      if (!isRunning) {
        await resumeAudioContext();
      }
      
      // Start recording
      start();
    } catch (err) {
      setError('Failed to start recording.');
    }
  }, [isMicrophoneEnabled, isRunning, enableMicrophone, resumeAudioContext, start]);

  // Recording stop function
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      const blob = await stop();
      setRecordedBlob(blob);
      return blob;
    } catch (err) {
      setError('Failed to stop recording.');
      return null;
    }
  }, [stop]);

  // Recording pause function
  const pauseRecording = useCallback(() => {
    pause();
  }, [pause]);

  // Recording resume function
  const resumeRecording = useCallback(() => {
    resume();
  }, [resume]);

  // Reset function
  const reset = useCallback(() => {
    resetRecorder();
    resetPlayer();
    resetTimer();
    setRecordedBlob(null);
    setError(null);
  }, [resetRecorder, resetPlayer, resetTimer]);

  // Microphone disable function (override)
  const disableMicrophoneOverride = useCallback(() => {
    disableMicrophone();
    reset();
  }, [disableMicrophone, reset]);

  // Return object
  return {
    // State
    isRecording,
    isPaused,
    isMicrophoneEnabled,
    isPlaying,
    permission,
    audioLevel,
    elapsedTime,
    formattedTime,
    recordedBlob,
    audioUrl,
    error,
    
    // Control functions
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    enableMicrophone,
    disableMicrophone: disableMicrophoneOverride,
    playPause,
    reset,
    resumeAudioContext,
    
    // References
    audioRef,
  };
}
