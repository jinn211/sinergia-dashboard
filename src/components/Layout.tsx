import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
