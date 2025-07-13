interface ChatSettingsButtonProps {
  // Add props as needed
}

export default function ChatSettingsButton(props: ChatSettingsButtonProps) {
  return (
    <button className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
      <span className="text-sm">Settings</span>
    </button>
  );
};
