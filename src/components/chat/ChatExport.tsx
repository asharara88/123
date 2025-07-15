import { useState } from 'react';
import { Download, FileText, Mail, Share2 } from 'lucide-react';
import { useChatStore } from '../../store';
import { useAuth } from '../../contexts/AuthContext';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'txt',
    name: 'Plain Text',
    description: 'Simple text format for easy reading',
    icon: <FileText className="w-5 h-5" />,
    extension: 'txt'
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format for developers',
    icon: <FileText className="w-5 h-5" />,
    extension: 'json'
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Web format with formatting preserved',
    icon: <FileText className="w-5 h-5" />,
    extension: 'html'
  }
];

interface ChatExportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatExport({ isOpen, onClose }: ChatExportProps) {
  const [selectedFormat, setSelectedFormat] = useState('txt');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { messages } = useChatStore();
  const { user } = useAuth();

  const generateFileName = (format: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `mycoach-conversation-${date}.${format}`;
  };

  const exportAsText = () => {
    let content = `MyCoach Conversation Export\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n`;
    content += `User: ${user?.email || 'Anonymous'}\n`;
    content += `Total Messages: ${messages.length}\n\n`;
    content += '=' .repeat(50) + '\n\n';

    messages.forEach((message, index) => {
      const timestamp = includeTimestamps && message.timestamp 
        ? ` (${message.timestamp.toLocaleString()})` 
        : '';
      
      content += `${message.role.toUpperCase()}${timestamp}:\n`;
      content += `${message.content}\n\n`;
      
      if (index < messages.length - 1) {
        content += '-'.repeat(30) + '\n\n';
      }
    });

    return content;
  };

  const exportAsJSON = () => {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        user: user?.email || 'Anonymous',
        totalMessages: messages.length,
        version: '1.0'
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: includeTimestamps ? msg.timestamp?.toISOString() : undefined
      }))
    };

    return JSON.stringify(exportData, null, 2);
  };

  const exportAsHTML = () => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyCoach Conversation Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .user { background-color: #3b82f6; color: white; margin-left: 20%; }
        .assistant { background-color: #f3f4f6; color: #1f2937; margin-right: 20%; }
        .role { font-weight: bold; margin-bottom: 5px; }
        .timestamp { font-size: 0.8em; opacity: 0.7; margin-top: 5px; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MyCoach Conversation Export</h1>
        <p><strong>Exported on:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>User:</strong> ${user?.email || 'Anonymous'}</p>
        <p><strong>Total Messages:</strong> ${messages.length}</p>
    </div>
    <div class="conversation">`;

    messages.forEach(message => {
      const timestamp = includeTimestamps && message.timestamp 
        ? `<div class="timestamp">${message.timestamp.toLocaleString()}</div>` 
        : '';
      
      html += `
        <div class="message ${message.role}">
            <div class="role">${message.role.toUpperCase()}</div>
            <div class="content">${message.content}</div>
            ${timestamp}
        </div>`;
    });

    html += `
    </div>
</body>
</html>`;

    return html;
  };

  const handleExport = async () => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    setExporting(true);

    try {
      let content: string;
      let mimeType: string;

      switch (selectedFormat) {
        case 'txt':
          content = exportAsText();
          mimeType = 'text/plain';
          break;
        case 'json':
          content = exportAsJSON();
          mimeType = 'application/json';
          break;
        case 'html':
          content = exportAsHTML();
          mimeType = 'text/html';
          break;
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName(selectedFormat);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && messages.length > 0) {
      try {
        const content = exportAsText();
        await navigator.share({
          title: 'MyCoach Conversation',
          text: content.substring(0, 500) + '...',
          files: [new File([content], generateFileName('txt'), { type: 'text/plain' })]
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Export Conversation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <div className="space-y-2">
                {exportFormats.map((format) => (
                  <label
                    key={format.id}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.id}
                      checked={selectedFormat === format.id}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600 dark:text-gray-400">
                        {format.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {format.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Include timestamps
                </span>
              </label>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {messages.length} messages will be exported
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {navigator.share && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={exporting || messages.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}