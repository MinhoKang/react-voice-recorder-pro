import React, { useState, useEffect } from 'react';
import { 
  useVoiceRecorder, 
  getBestAudioFormat, 
  downloadBlob, 
  formatFileSize,
  getDeviceInfo 
} from 'react-voice-recorder-pro';

/**
 * Advanced usage example
 * Voice recorder component showcasing various options and features
 */
export function AdvancedVoiceRecorder() {
  const [recordingHistory, setRecordingHistory] = useState<Blob[]>([]);
  const [selectedFormat, setSelectedFormat] = useState(getBestAudioFormat());
  const [maxRecordingTime, setMaxRecordingTime] = useState(60); // seconds
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  const {
    isRecording,
    isPaused,
    isMicrophoneEnabled,
    audioLevel,
    formattedTime,
    recordedBlob,
    audioUrl,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    enableMicrophone,
    disableMicrophone,
    playPause,
    isPlaying,
    reset,
    audioRef,
  } = useVoiceRecorder({
    mimeType: selectedFormat,
    smoothing: 0.9,
    fftSize: 4096,
    autoEnableMicrophone: false,
    autoPlayAfterRecording: false,
  });

  // Check max recording time
  useEffect(() => {
    if (isRecording && !isPaused) {
      const timer = setInterval(() => {
        if (recordingStartTime) {
          const elapsed = (Date.now() - recordingStartTime) / 1000;
          if (elapsed >= maxRecordingTime) {
            stopRecording();
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isRecording, isPaused, recordingStartTime, maxRecordingTime, stopRecording]);

  const handleStartRecording = async () => {
    if (!isMicrophoneEnabled) {
      await enableMicrophone();
    }
    setRecordingStartTime(Date.now());
    startRecording();
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      setRecordingHistory(prev => [...prev, blob]);
      setRecordingStartTime(null);
    }
  };

  const handleDownload = (blob: Blob, index: number) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const extension = selectedFormat.split('/')[1];
    downloadBlob(blob, `recording-${index + 1}-${timestamp}.${extension}`);
  };

  const deviceInfo = getDeviceInfo();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Advanced Voice Recorder</h2>
      
      {/* Device info */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        <p><strong>Device Info:</strong></p>
        <p>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'} | 
           iOS: {deviceInfo.isIOS ? 'Yes' : 'No'} | 
           Android: {deviceInfo.isAndroid ? 'Yes' : 'No'}</p>
        <p>Browser: {deviceInfo.isSafari ? 'Safari' : deviceInfo.isChrome ? 'Chrome' : deviceInfo.isFirefox ? 'Firefox' : 'Other'}</p>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Settings</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Audio format:
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
              style={{ marginLeft: '10px' }}
            >
              <option value="audio/webm">WebM</option>
              <option value="audio/mp4">MP4</option>
              <option value="audio/wav">WAV</option>
              <option value="audio/ogg">OGG</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Max recording time (sec):
            <input 
              type="number" 
              value={maxRecordingTime} 
              onChange={(e) => setMaxRecordingTime(Number(e.target.value))}
              min="10"
              max="300"
              style={{ marginLeft: '10px', width: '80px' }}
            />
          </label>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Microphone status */}
      <div style={{ marginBottom: '20px' }}>
        <p>Microphone: 
          <span style={{ 
            color: isMicrophoneEnabled ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {isMicrophoneEnabled ? ' Enabled' : ' Disabled'}
          </span>
        </p>
        {!isMicrophoneEnabled && (
          <button 
            onClick={enableMicrophone}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Enable Microphone
          </button>
        )}
      </div>

      {/* Recording controls */}
      <div style={{ marginBottom: '20px' }}>
        {!isRecording ? (
          <button 
            onClick={handleStartRecording}
            disabled={!isMicrophoneEnabled}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: isMicrophoneEnabled ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isMicrophoneEnabled ? 'pointer' : 'not-allowed',
            }}
          >
            Start Recording
          </button>
        ) : (
          <div>
            {isPaused ? (
              <button 
                onClick={resumeRecording}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Resume
              </button>
            ) : (
              <button 
                onClick={pauseRecording}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Pause
              </button>
            )}
            <button 
              onClick={handleStopRecording}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Recording progress */}
      {isRecording && (
        <div style={{ 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#e8f5e8',
          borderRadius: '8px'
        }}>
          <p><strong>Recording...</strong></p>
          <p>Time: {formattedTime}</p>
          <p>Time left: {Math.max(0, maxRecordingTime - Math.floor((Date.now() - (recordingStartTime || 0)) / 1000))}s</p>
          
          {/* Audio level visualization */}
          <div style={{ marginTop: '10px' }}>
            <p>Audio Level: {(audioLevel * 100).toFixed(1)}%</p>
            <div style={{ 
              width: '100%', 
              height: '30px', 
              backgroundColor: '#f0f0f0',
              borderRadius: '15px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div 
                style={{
                  width: `${audioLevel * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A, #CDDC39, #FFEB3B, #FF9800, #f44336)',
                  transition: 'width 0.1s ease',
                  borderRadius: '15px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Current recorded audio */}
      {recordedBlob && audioUrl && (
        <div style={{ 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px'
        }}>
          <h3>Latest Recording</h3>
          <p>File size: {formatFileSize(recordedBlob.size)}</p>
          <audio 
            ref={audioRef}
            src={audioUrl}
            controls
            style={{ width: '100%', marginTop: '10px' }}
          />
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={playPause}
              style={{
                padding: '8px 16px',
                backgroundColor: isPlaying ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button 
              onClick={() => handleDownload(recordedBlob, recordingHistory.length)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Download
            </button>
            <button 
              onClick={reset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9E9E9E',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Recording history */}
      {recordingHistory.length > 0 && (
        <div>
          <h3>Recording History ({recordingHistory.length})</h3>
          {recordingHistory.map((blob, index) => (
            <div 
              key={index}
              style={{ 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
                backgroundColor: '#fafafa'
              }}
            >
              <p>Recording #{index + 1} - Size: {formatFileSize(blob.size)}</p>
              <button 
                onClick={() => handleDownload(blob, index)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Disable microphone */}
      {isMicrophoneEnabled && (
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={disableMicrophone}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9E9E9E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Disable Microphone
          </button>
        </div>
      )}
    </div>
  );
}
