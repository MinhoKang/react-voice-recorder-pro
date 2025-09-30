import { SUPPORTED_AUDIO_FORMATS, AudioFormat } from '../types';

/**
 * Check audio formats supported by browser
 */
export function getSupportedAudioFormats(): AudioFormat[] {
  return SUPPORTED_AUDIO_FORMATS.filter(format => {
    if (!MediaRecorder.isTypeSupported) return false;
    return MediaRecorder.isTypeSupported(format.mimeType);
  });
}

/**
 * Select optimal audio format
 */
export function getBestAudioFormat(): string {
  const supportedFormats = getSupportedAudioFormats();
  
  // Priority: webm > mp4 > wav > ogg
  const priority = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg'];
  
  for (const mimeType of priority) {
    const format = supportedFormats.find(f => f.mimeType === mimeType);
    if (format) return format.mimeType;
  }
  
  // Default value
  return 'audio/webm';
}

/**
 * Download Blob
 */
export function downloadBlob(blob: Blob, filename: string = 'recording'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert Blob to Base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:audio/...;base64, part
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert Base64 string to Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'audio/webm'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Format file size in human-readable form
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format time in human-readable form
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Convert audio level for visualization
 */
export function normalizeAudioLevel(level: number, minLevel: number = 0.01): number {
  // Convert to log scale for more natural visualization
  const normalized = Math.max(0, Math.min(1, level));
  return normalized < minLevel ? 0 : normalized;
}

/**
 * Check if browser supports MediaRecorder
 */
export function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!MediaRecorder.isTypeSupported;
}

/**
 * Check if browser supports getUserMedia
 */
export function isGetUserMediaSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Check if browser supports Web Audio API
 */
export function isWebAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * Get device information
 */
export function getDeviceInfo(): {
  userAgent: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
} {
  const userAgent = navigator.userAgent;
  
  return {
    userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
  };
}
