// 메인 훅 export
export { useVoiceRecorder } from './hooks/useVoiceRecorder';

// 개별 훅들 export (고급 사용자를 위해)
export { useAudioContext } from './hooks/useAudioContext';
export { useAudioMeter } from './hooks/useAudioMeter';
export { useAudioPlayer } from './hooks/useAudioPlayer';
export { useMediaRecorder } from './hooks/useMediaRecorder';
export { useMicrophone } from './hooks/useMicrophone';
export { useRecordingTimer } from './hooks/useRecordingTimer';

// 타입들 export
export type {
  VoiceRecorderOptions,
  VoiceRecorderState,
  VoiceRecorderControls,
  UseVoiceRecorderReturn,
  AudioFormat,
  VoiceRecorderError,
  VoiceRecorderEvents,
  VoiceRecorderConfig,
} from './types';

// 유틸리티 함수들 export
export {
  getSupportedAudioFormats,
  getBestAudioFormat,
  downloadBlob,
  blobToBase64,
  base64ToBlob,
  formatFileSize,
  formatDuration,
  normalizeAudioLevel,
  isMediaRecorderSupported,
  isGetUserMediaSupported,
  isWebAudioSupported,
  getDeviceInfo,
} from './utils';

// 상수들 export
export { SUPPORTED_AUDIO_FORMATS } from './types';
