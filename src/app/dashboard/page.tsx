'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudySyncStore } from '@/lib/store';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = StudySyncStore.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=/dashboard');
    } else {
      router.push(`/dashboard/${user.role}`);
    }
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-duo-green border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">Redirecting to your workspace...</p>
      </div>
    </div>
  );
}
