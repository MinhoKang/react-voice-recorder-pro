# 🎤 React Voice Recorder Pro

[![npm version](https://badge.fury.io/js/react-voice-recorder-pro.svg)](https://badge.fury.io/js/react-voice-recorder-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**Powerful and easy voice recording in React!** 🚀

React Voice Recorder Pro is an all-in-one hook-based library for implementing voice recording functionality in React applications. It leverages Web Audio API and MediaRecorder API to provide high-quality voice recording, real-time audio level measurement, and comprehensive browser compatibility.

Note: This library has no extra audio dependencies. It is implemented purely with standard Web APIs (MediaRecorder, Web Audio) without third‑party audio libraries.

## 🎮 Live Demo

Try the demo app here: [react-voice-recorder-pro-demo](https://github.com/MinhoKang/react-voice-recorder-pro-demo)

## ✨ Key Features

- 🎯 **All-in-one Hook**: All functionality provided through `useVoiceRecorder`
- 🎤 **Real-time Audio Level**: Real-time audio level measurement and visualization during recording
- ⏯️ **Complete Recording Control**: Start, stop, pause, resume functionality
- 🔊 **Built-in Player**: Instant playback of recorded audio
- 📱 **Mobile Optimized**: Perfect support for iOS Safari, Android Chrome
- 🎨 **TypeScript Support**: Complete type safety
- 🌐 **Browser Compatibility**: Chrome, Firefox, Safari, Edge support
- 📦 **Lightweight**: Optimized bundle size
- 🔧 **Flexible Configuration**: Various options and customization support
- 🧩 **No extra deps**: Built purely on Web APIs (MediaRecorder, Web Audio) — no third‑party audio libraries

## 🚀 Quick Start

### Installation

```bash
npm install react-voice-recorder-pro
# or
yarn add react-voice-recorder-pro
```

### Basic Usage

```tsx
import React from 'react';
import { useVoiceRecorder } from 'react-voice-recorder-pro';

function VoiceRecorder() {
  const {
    isRecording,
    isMicrophoneEnabled,
    audioLevel,
    formattedTime,
    recordedBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    enableMicrophone,
    playPause,
    isPlaying,
    audioRef,
  } = useVoiceRecorder();

  const handleStartRecording = async () => {
    if (!isMicrophoneEnabled) {
      await enableMicrophone();
    }
    startRecording();
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    console.log('Recording completed:', blob);
  };

  return (
    <div>
      <h2>Voice Recorder</h2>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      <div>
        <p>Microphone: {isMicrophoneEnabled ? 'Enabled' : 'Disabled'}</p>
        {!isMicrophoneEnabled && (
          <button onClick={enableMicrophone}>Enable Microphone</button>
        )}
      </div>

      <div>
        {!isRecording ? (
          <button onClick={handleStartRecording}>Start Recording</button>
        ) : (
          <button onClick={handleStopRecording}>Stop Recording</button>
        )}
      </div>

      {isRecording && (
        <div>
          <p>Recording Time: {formattedTime}</p>
          <div style={{ width: '200px', height: '20px', backgroundColor: '#f0f0f0' }}>
            <div 
              style={{ 
                width: `${audioLevel * 100}%`, 
                height: '100%', 
                backgroundColor: '#4CAF50' 
              }} 
            />
          </div>
        </div>
      )}

      {recordedBlob && audioUrl && (
        <div>
          <audio ref={audioRef} src={audioUrl} controls />
          <button onClick={playPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
```

## 📚 API Documentation

### useVoiceRecorder(options?)

The main hook that provides all voice recording functionality.

#### Options (VoiceRecorderOptions)

```tsx
interface VoiceRecorderOptions {
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
```

#### Return Value (UseVoiceRecorderReturn)

```tsx
interface UseVoiceRecorderReturn {
  // State
  isRecording: boolean;           // Whether currently recording
  isPaused: boolean;              // Whether recording is paused
  isMicrophoneEnabled: boolean;   // Whether microphone is enabled
  isPlaying: boolean;             // Whether audio is playing
  permission: PermissionState | 'prompt' | 'unknown'; // Microphone permission state
  audioLevel: number;             // Current audio level (0-1)
  elapsedTime: number;            // Recording elapsed time (seconds)
  formattedTime: string;          // Formatted recording time (HH:MM:SS)
  recordedBlob: Blob | null;      // Recorded audio Blob
  audioUrl: string | null;        // Audio URL (for playback)
  error: string | null;           // Error message

  // Control functions
  startRecording: () => void;     // Start recording
  pauseRecording: () => void;     // Pause recording
  resumeRecording: () => void;    // Resume recording
  stopRecording: () => Promise<Blob | null>; // Stop recording and return Blob
  enableMicrophone: () => Promise<void>;     // Enable microphone
  disableMicrophone: () => void;  // Disable microphone
  playPause: () => void;          // Play/pause recorded audio
  reset: () => void;              // Reset recording state
  resumeAudioContext: () => Promise<void>; // Resume audio context (for iOS/Safari)

  // References
  audioRef: React.RefObject<HTMLAudioElement | null>; // HTML Audio element reference
}
```

## 🛠️ Advanced Usage

### Using Custom Options

```tsx
const recorder = useVoiceRecorder({
  mimeType: 'audio/mp4',           // Use MP4 format
  smoothing: 0.9,                  // Smoother audio level
  fftSize: 4096,                   // More accurate analysis
  autoEnableMicrophone: true,      // Auto microphone activation
  autoPlayAfterRecording: true,    // Auto play after recording
});
```

### Using Individual Hooks

Individual hooks are also provided for advanced users:

```tsx
import { 
  useAudioContext,
  useAudioMeter,
  useAudioPlayer,
  useMediaRecorder,
  useMicrophone,
  useRecordingTimer
} from 'react-voice-recorder-pro';

// Can be used individually
const { audioContext, isRunning, resume } = useAudioContext();
const { stream, isEnabled, enable, disable } = useMicrophone();
// ... other hooks
```

### Using Utility Functions

```tsx
import { 
  getBestAudioFormat,
  downloadBlob,
  formatFileSize,
  formatDuration,
  isMediaRecorderSupported
} from 'react-voice-recorder-pro';

// Select optimal audio format
const bestFormat = getBestAudioFormat();

// Download file
downloadBlob(blob, 'my-recording.webm');

// Format file size
const size = formatFileSize(blob.size); // "1.2 MB"

// Format duration
const duration = formatDuration(120); // "2:00"

// Check browser support
if (isMediaRecorderSupported()) {
  // MediaRecorder is available
}
```

## 📱 Mobile Support

### iOS Safari

In iOS Safari, audio context must be activated after user gesture:

```tsx
const { resumeAudioContext } = useVoiceRecorder();

const handleUserInteraction = async () => {
  await resumeAudioContext(); // Call after user gesture
  // Now recording can be started
};
```

### Android Chrome

Android Chrome requires no additional setup. It works well with default settings.

## 🌐 Browser Support

| Browser | Version | Support Status |
|---------|---------|----------------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |
| iOS Safari | 13+ | ✅ Full Support |
| Android Chrome | 80+ | ✅ Full Support |

## 📦 Bundle Size

- **gzipped**: ~15KB
- **minified**: ~45KB
- **Individual hooks**: ~3-8KB each

## 🔧 Development and Build

### Development Environment Setup

```bash
# Clone repository
git clone https://github.com/yourusername/react-voice-recorder-pro.git
cd react-voice-recorder-pro

# Install dependencies
npm install

# Run development mode
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

### Testing

```bash
npm test
```

## 📖 Examples

For more examples, see the [`examples/`](./examples/) folder:

- [Basic Usage](./examples/basic-usage.tsx)
- [Advanced Usage](./examples/advanced-usage.tsx)
- [Voice Memo App](./examples/voice-memo-app.tsx)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📄 License

This project is distributed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

Found a bug? Please report it on the [Issues](https://github.com/yourusername/react-voice-recorder-pro/issues) page.

## 💡 Feature Requests

Want to suggest a new feature? Please propose it on the [Issues](https://github.com/yourusername/react-voice-recorder-pro/issues) page with the "Feature Request" label.

## 🙏 Acknowledgments

This library was built with the help of the following open source projects:

- [React](https://reactjs.org/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

## 📞 Support

- 📧 Email: rkdalsgh0106@naver.com
---

Build amazing voice recording apps with **React Voice Recorder Pro**! 🎤✨
