'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { StudySyncStore } from '@/lib/store';
import { Profile } from '@/types';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setCurrentUser(StudySyncStore.getCurrentUser());
    update();

    window.addEventListener('studysync_storage_update', update);
    return () => window.removeEventListener('studysync_storage_update', update);
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';
  const isPublicPage = isAuthPage || (isLandingPage && !currentUser);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">{children}</main>
      </div>
    );
  }

  if (isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <TopBar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Sidebar />
      <div className="md:pl-64 lg:pl-72 flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
};
