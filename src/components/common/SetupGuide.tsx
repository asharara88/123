import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

export const SetupGuide = ({ onClose }: SetupGuideProps) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Configure OpenAI API Key",
      content: (
        <div className="space-y-4">
          <p>To use AI features, you need to configure your OpenAI API key:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">OpenAI API Keys <ExternalLink size={12} /></a></li>
            <li>Create a new API key</li>
            <li>Add it to your environment variables as <code className="bg-gray-100 px-1 rounded">VITE_OPENAI_API_KEY</code></li>
            <li>Restart your development server</li>
          </ol>
        </div>
      )
    },
    {
      title: "Configure ElevenLabs API Key (Optional)",
      content: (
        <div className="space-y-4">
          <p>For text-to-speech features, configure your ElevenLabs API key:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">ElevenLabs API Keys <ExternalLink size={12} /></a></li>
            <li>Create a new API key</li>
            <li>Add it to your environment variables as <code className="bg-gray-100 px-1 rounded">VITE_ELEVENLABS_API_KEY</code></li>
            <li>Restart your development server</li>
          </ol>
        </div>
      )
    },
    {
      title: "Configure Supabase (Optional)",
      content: (
        <div className="space-y-4">
          <p>For user authentication and data storage:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a Supabase project</li>
            <li>Add your Supabase URL as <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code></li>
            <li>Add your Supabase anon key as <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
            <li>Restart your development server</li>
          </ol>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Setup Guide
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-full h-2 rounded-full ${
                    index + 1 <= step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Step {step}: {steps[step - 1].title}
            </h3>
            <div className="text-gray-700 dark:text-gray-300">
              {steps[step - 1].content}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            
            {step < steps.length ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
