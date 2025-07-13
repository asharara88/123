import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src?: string;
  onEnded?: () => void;
}

export default function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (src && audioRef.current) {
      audioRef.current.src = src;
    }
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onEnded?.();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 bg-[hsl(var(--color-surface-1))] rounded-lg">
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <button 
        onClick={togglePlay}
        className="p-2 rounded-full hover:bg-[hsl(var(--color-card-hover))] text-[hsl(var(--color-primary))]"
        disabled={!src}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      
      <div className="flex-1 h-2 bg-[hsl(var(--color-surface-2))] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[hsl(var(--color-primary))] rounded-full transition-all duration-100" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <Volume2 size={16} className="text-[hsl(var(--color-text-light))]" />
    </div>
  );
};
