import { Suspense } from 'react';
import { Loader } from 'lucide-react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
      <Loader className="w-5 h-5 animate-spin" />
      <span>Loading...</span>
    </div>
  </div>
);

export default function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      {children}
    </Suspense>
  );
}