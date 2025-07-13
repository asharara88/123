// Simple markdown-like text processor to avoid dependency
function processMarkdownText(text: string): string {
  return text
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert `code` to <code>
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Convert line breaks
    .replace(/\n/g, '<br/>');
}

interface MessageContentProps {
  content: string;
  role?: 'user' | 'assistant' | 'system';
}

export const MessageContent = ({ content, role = 'assistant' }: MessageContentProps) => {
  if (role === 'user') {
    return (
      <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  return (
    <div 
      className="text-gray-900 dark:text-gray-100 prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: processMarkdownText(content) }}
    />
    </div>
  );
};
