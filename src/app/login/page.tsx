'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LogIn } from 'lucide-react';
import { StudySyncStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    errorParam === 'unauthorized'
      ? 'Access restricted: Please log in with appropriate role permissions.'
      : null
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please provide your email address or username.');
      return;
    }

    setLoading(true);

    try {
      const res = await StudySyncStore.login(identifier, password);

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.user) {
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push(`/dashboard/${res.user.role}`);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="card-duo p-8 bg-white max-w-md w-full shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-duo-green flex items-center justify-center text-white border-b-2 border-duo-green-dark mx-auto mb-3 shadow-sm">
            <span className="text-2xl">🦉</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Sign in to access your StudySync learning workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-200 text-xs font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1">
              Email or Username *
            </label>
            <input
              type="text"
              placeholder="e.g. AureliaCodes or aurelia@edu.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase text-gray-600">
                Password *
              </label>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-tactile btn-tactile-green py-3 text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t-2 border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium">
            New to StudySync?{' '}
            <Link href="/register" className="font-black text-duo-green hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
