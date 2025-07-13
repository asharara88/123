interface AudioPlayerProps {
  // Add props as needed
}

export default function AudioPlayer(props: AudioPlayerProps) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg">
      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
        <span className="text-sm">▶️</span>
      </button>
      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded">
        <div className="h-full bg-blue-500 rounded" style={{ width: '30%' }}></div>
      </div>
    </div>
  );
};
