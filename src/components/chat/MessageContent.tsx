import ReactMarkdown from 'react-markdown';

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
    <div className="text-gray-900 dark:text-gray-100 prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
