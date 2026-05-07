import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface Props { children: ReactNode; }

export default function Layout({ children }: Props) {
  return (
    <div className="flex w-full min-h-screen bg-surface-100">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
