interface AudioVisualizerProps {
  // Add props as needed
}

export default function AudioVisualizer(props: AudioVisualizerProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-1 h-4 bg-blue-500 rounded animate-pulse"></div>
      <div className="w-1 h-6 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-1 h-3 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-1 h-5 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
    </div>
  );
};
