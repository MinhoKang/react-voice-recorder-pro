// Basic type definitions
export type { 
  VoiceRecorderOptions, 
  VoiceRecorderState, 
  VoiceRecorderControls, 
  UseVoiceRecorderReturn 
} from '../hooks/useVoiceRecorder';

// Additional utility types
export interface AudioFormat {
  /** MIME type */
  mimeType: string;
  /** File extension */
  extension: string;
  /** Browser support status */
  supported: boolean;
}

// Supported audio formats
export const SUPPORTED_AUDIO_FORMATS: AudioFormat[] = [
  { mimeType: 'audio/webm', extension: 'webm', supported: true },
  { mimeType: 'audio/mp4', extension: 'mp4', supported: true },
  { mimeType: 'audio/wav', extension: 'wav', supported: true },
  { mimeType: 'audio/ogg', extension: 'ogg', supported: true },
];

// Error type definition
export interface VoiceRecorderError {
  code: string;
  message: string;
  details?: any;
}

// Event type definition
export interface VoiceRecorderEvents {
  onRecordingStart?: () => void;
  onRecordingPause?: () => void;
  onRecordingResume?: () => void;
  onRecordingStop?: (blob: Blob) => void;
  onMicrophoneEnabled?: () => void;
  onMicrophoneDisabled?: () => void;
  onError?: (error: VoiceRecorderError) => void;
  onAudioLevelChange?: (level: number) => void;
}

// Configuration type definition
export interface VoiceRecorderConfig {
  /** MIME type of recorded file */
  mimeType?: string;
  /** Smoothing coefficient for audio level measurement */
  smoothing?: number;
  /** FFT size */
  fftSize?: number;
  /** Whether to automatically enable microphone */
  autoEnableMicrophone?: boolean;
  /** Whether to automatically play after recording */
  autoPlayAfterRecording?: boolean;
  /** Event handlers */
  events?: VoiceRecorderEvents;
  /** Maximum recording time (seconds, 0 for unlimited) */
  maxRecordingTime?: number;
  /** Minimum recording time (seconds) */
  minRecordingTime?: number;
  /** Recording quality setting */
  quality?: 'low' | 'medium' | 'high';
}
