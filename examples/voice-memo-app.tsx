import React, { useState, useEffect } from 'react';
import { 
  useVoiceRecorder, 
  downloadBlob, 
  formatFileSize,
  formatDuration,
} from 'react-voice-recorder-pro';

interface VoiceMemo {
  id: string;
  title: string;
  blob: Blob;
  duration: number;
  createdAt: Date;
  audioUrl: string;
}

/**
 * Voice memo app example
 * A complete voice memo feature set suitable for real apps
 */
export function VoiceMemoApp() {
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [currentMemoTitle, setCurrentMemoTitle] = useState('');
  const [selectedMemo, setSelectedMemo] = useState<VoiceMemo | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

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
    mimeType: 'audio/webm',
    smoothing: 0.8,
    autoEnableMicrophone: false,
    autoPlayAfterRecording: false,
  });

  // Load memos from localStorage
  useEffect(() => {
    const savedMemos = localStorage.getItem('voiceMemos');
    if (savedMemos) {
      try {
        const parsedMemos = JSON.parse(savedMemos);
        // Blob cannot be serialized, store URL only and recreate when needed
        setMemos(parsedMemos.map((memo: any) => ({
          ...memo,
          createdAt: new Date(memo.createdAt),
          blob: null, // should be restored from stored data in a real scenario
        })));
      } catch (error) {
        console.error('Failed to load memos:', error);
      }
    }
  }, []);

  // Save memo
  const saveMemo = async () => {
    if (!recordedBlob) return;

    const newMemo: VoiceMemo = {
      id: Date.now().toString(),
      title: currentMemoTitle || `Voice memo ${memos.length + 1}`,
      blob: recordedBlob,
      duration: Math.floor((Date.now() - recordingStartTime) / 1000),
      createdAt: new Date(),
      audioUrl: audioUrl || '',
    };

    setMemos(prev => [newMemo, ...prev]);
    setCurrentMemoTitle('');
    reset();
  };

  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

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
      // Automatically save memo
      await saveMemo();
    }
    setRecordingStartTime(null);
  };

  const handlePlayMemo = (memo: VoiceMemo) => {
    if (selectedMemo?.id === memo.id && isPlaying) {
      playPause();
    } else {
      setSelectedMemo(memo);
      // Set new audio URL
      if (audioRef.current) {
        audioRef.current.src = memo.audioUrl;
        audioRef.current.play();
      }
    }
  };

  const handleDeleteMemo = (memoId: string) => {
    setMemos(prev => prev.filter(memo => memo.id !== memoId));
    if (selectedMemo?.id === memoId) {
      setSelectedMemo(null);
    }
  };

  const handleDownloadMemo = (memo: VoiceMemo) => {
    const timestamp = memo.createdAt.toISOString().slice(0, 19).replace(/:/g, '-');
    downloadBlob(memo.blob, `${memo.title}-${timestamp}.webm`);
  };

  const handleEditTitle = (memoId: string, newTitle: string) => {
    setMemos(prev => prev.map(memo => 
      memo.id === memoId ? { ...memo, title: newTitle } : memo
    ));
    setIsEditingTitle(false);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🎤 Voice Memo App</h1>
      
      {/* Recording controls */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h2>New Voice Memo</h2>
        
        {/* Title input */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Memo title (optional)"
            value={currentMemoTitle}
            onChange={(e) => setCurrentMemoTitle(e.target.value)}
            style={{
              width: '300px',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffebee',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        {/* Microphone status */}
        <div style={{ marginBottom: '15px' }}>
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
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Enable Microphone
            </button>
          )}
        </div>

        {/* Recording controls */}
        <div style={{ marginBottom: '15px' }}>
          {!isRecording ? (
            <button 
              onClick={handleStartRecording}
              disabled={!isMicrophoneEnabled}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                backgroundColor: isMicrophoneEnabled ? '#4CAF50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isMicrophoneEnabled ? 'pointer' : 'not-allowed',
                marginRight: '10px',
              }}
            >
              🎤 Start Recording
            </button>
          ) : (
            <div>
              {isPaused ? (
                <button 
                  onClick={resumeRecording}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginRight: '10px',
                  }}
                >
                  ▶️ Resume
                </button>
              ) : (
                <button 
                  onClick={pauseRecording}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginRight: '10px',
                  }}
                >
                  ⏸️ Pause
                </button>
              )}
              <button 
                onClick={handleStopRecording}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ⏹️ Stop
              </button>
            </div>
          )}
        </div>

        {/* Recording progress */}
        {isRecording && (
          <div style={{ 
            backgroundColor: '#e8f5e8',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <p><strong>Recording...</strong></p>
            <p>Time: {formattedTime}</p>
            
            {/* Audio level visualization */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#f0f0f0',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{
                    width: `${audioLevel * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4CAF50, #8BC34A, #FFEB3B, #FF9800, #f44336)',
                    transition: 'width 0.1s ease',
                    borderRadius: '10px',
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', marginTop: '5px' }}>
                Level: {(audioLevel * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Voice memo list */}
      <div>
        <h2>Voice memos ({memos.length})</h2>
        
        {memos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p>No voice memos yet.</p>
            <p>Press the record button above to create your first memo!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {memos.map((memo) => (
              <div 
                key={memo.id}
                style={{ 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: selectedMemo?.id === memo.id ? '#e3f2fd' : 'white',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {isEditingTitle && selectedMemo?.id === memo.id ? (
                      <input
                        type="text"
                        defaultValue={memo.title}
                        onBlur={(e) => handleEditTitle(memo.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditTitle(memo.id, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          border: '1px solid #2196F3',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      />
                    ) : (
                      <h3 
                        style={{ 
                          margin: '0 0 10px 0',
                          color: '#333',
                          cursor: 'pointer'
                        }}
                        onClick={() => setIsEditingTitle(true)}
                      >
                        {memo.title}
                      </h3>
                    )}
                    
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                      <p>Created: {memo.createdAt.toLocaleString()}</p>
                      <p>Duration: {formatDuration(memo.duration)}</p>
                      <p>Size: {formatFileSize(memo.blob.size)}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button 
                      onClick={() => handlePlayMemo(memo)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: selectedMemo?.id === memo.id && isPlaying ? '#f44336' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {selectedMemo?.id === memo.id && isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                    
                    <button 
                      onClick={() => handleDownloadMemo(memo)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      📥 Download
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteMemo(memo.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        onEnded={() => {
          if (selectedMemo) {
            setSelectedMemo(null);
          }
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
}
