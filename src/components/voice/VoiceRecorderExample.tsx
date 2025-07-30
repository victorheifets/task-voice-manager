import React, { useState, useEffect } from 'react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language?: string;
}

const VoiceRecorderExample: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  language = 'en-US'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    const recognitionInstance = new SpeechRecognition();
    
    // Configure
    recognitionInstance.continuous = true;     // Don't stop after silence
    recognitionInstance.interimResults = true; // Get results as you speak
    recognitionInstance.lang = language;       // Set language

    // Handle results
    recognitionInstance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      onTranscript(transcript);
    };

    // Handle errors
    recognitionInstance.onerror = (event) => {
      setError(`Error: ${event.error}`);
      setIsRecording(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.abort();
    };
  }, [language, onTranscript]);

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="voice-recorder">
      <button 
        onClick={toggleRecording}
        disabled={!recognition}
        className={`record-button ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      <style jsx>{`
        .voice-recorder {
          padding: 20px;
          text-align: center;
        }
        .record-button {
          padding: 12px 24px;
          border-radius: 25px;
          border: none;
          background: #007AFF;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .record-button:hover {
          background: #0056b3;
        }
        .record-button.recording {
          background: #dc3545;
          animation: pulse 1.5s infinite;
        }
        .error {
          color: #dc3545;
          margin-top: 10px;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecorderExample;
