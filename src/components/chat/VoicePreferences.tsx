interface VoicePreferencesProps {
  // Add props as needed
}

export default function VoicePreferences(props: VoicePreferencesProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Voice Preferences</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Voice settings will be available here.
      </p>
    </div>
  );
};
