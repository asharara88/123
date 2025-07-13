import { useState, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

interface VoiceInputProps {
  onVoiceInput?: (text: string) => void;
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  disabled?: boolean;
}

export default function VoiceInput({ 
  onVoiceInput, 
  onRecordingStart, 
  onRecordingEnd, 
  disabled = false 
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        onRecordingEnd?.();

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Simulate speech-to-text conversion for demo
        setTimeout(() => {
          onVoiceInput?.("How can I improve my sleep quality?");
          setIsProcessing(false);
        }, 1000);

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      onRecordingStart?.();
    } catch (err) {
      setError('Microphone access denied or not available');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClick = () => {
    if (disabled || isProcessing) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getIcon = () => {
    if (isProcessing) return <Loader className="animate-spin" size={16} />;
    if (isRecording) return <MicOff size={16} />;
    return <Mic size={16} />;
  };

  const getButtonClass = () => {
    let baseClass = "p-2 rounded-lg border transition-colors duration-200 ";
    
    if (disabled || isProcessing) {
      baseClass += "opacity-50 cursor-not-allowed ";
    } else if (isRecording) {
      baseClass += "bg-red-100 border-red-300 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 ";
    } else {
      baseClass += "hover:bg-gray-50 dark:hover:bg-gray-800 ";
    }
    
    return baseClass;
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={getButtonClass()}
        title={isRecording ? "Stop recording" : "Start voice input"}
      >
        {getIcon()}
      </button>
      {error && (
        <div className="text-xs text-red-500 mt-1 max-w-[100px] text-center">
          {error}
        </div>
      )}
    </div>
  );
};