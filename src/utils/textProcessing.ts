// Text processing utilities for speech synthesis

/**
 * Prepare text for speech synthesis by cleaning up markdown and special characters
 */
export const prepareTextForSpeech = (text: string): string => {
  return text
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove markdown bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove markdown links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up multiple spaces and newlines
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
};

/**
 * Truncate text for speech synthesis to stay within limits
 */
export const truncateForSpeech = (text: string, maxLength: number = 5000): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Try to truncate at sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastPunctuation = Math.max(lastSentence, lastExclamation, lastQuestion);
  
  if (lastPunctuation > maxLength * 0.8) {
    return truncated.substring(0, lastPunctuation + 1);
  }
  
  // If no good sentence boundary, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.9) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};
