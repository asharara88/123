interface AudioVisualizerProps {
  audioUrl?: string;
  isPlaying?: boolean;
}

export default function AudioVisualizer({ audioUrl, isPlaying = false }: AudioVisualizerProps) {
  if (!audioUrl) return null;

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-[hsl(var(--color-primary))] rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : 'opacity-50'
          }`}
          style={{
            height: `${Math.random() * 20 + 8}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
