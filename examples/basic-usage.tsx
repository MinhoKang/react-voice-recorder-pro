import React from 'react';
import { useVoiceRecorder } from 'react-voice-recorder-pro';

/**
 * Basic usage example
 * Simplest form of voice recording component
 */
export function BasicVoiceRecorder() {
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
  } = useVoiceRecorder();

  const handleStartRecording = async () => {
    if (!isMicrophoneEnabled) {
      await enableMicrophone();
    }
    startRecording();
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      console.log('Recording completed:', blob);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Basic Voice Recorder</h2>
      
      {/* Error display */}
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      {/* Microphone status */}
      <div style={{ marginBottom: '20px' }}>
        <p>Microphone Status: {isMicrophoneEnabled ? 'Enabled' : 'Disabled'}</p>
        {!isMicrophoneEnabled && (
          <button onClick={enableMicrophone}>
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
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Start Recording
          </button>
        ) : (
          <div>
            {isPaused ? (
              <button onClick={resumeRecording}>
                Resume
              </button>
            ) : (
              <button onClick={pauseRecording}>
                Pause
              </button>
            )}
            <button onClick={handleStopRecording}>
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Recording time and audio level */}
      {isRecording && (
        <div style={{ marginBottom: '20px' }}>
          <p>Recording Time: {formattedTime}</p>
          <div style={{ 
            width: '200px', 
            height: '20px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div 
              style={{
                width: `${audioLevel * 100}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.1s ease'
              }}
            />
          </div>
          <p>Audio Level: {(audioLevel * 100).toFixed(1)}%</p>
        </div>
      )}

      {/* Recorded audio playback */}
      {recordedBlob && audioUrl && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Recorded Audio</h3>
          <audio 
            ref={audioRef}
            src={audioUrl}
            controls
            onEnded={() => console.log('Playback completed')}
          />
          <div style={{ marginTop: '10px' }}>
            <button onClick={playPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Disable microphone */}
      {isMicrophoneEnabled && (
        <button onClick={disableMicrophone}>
          Disable Microphone
        </button>
      )}
    </div>
  );
}
