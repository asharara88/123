import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isDemo } = useAuth();

  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      <Navbar />
      <div className="flex">
        {(user || isDemo) && <Sidebar />}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}