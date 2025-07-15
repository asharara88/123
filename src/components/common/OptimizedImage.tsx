import { useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ width, height }}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}