'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldAlert, GraduationCap, Users } from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('role') as UserRole) || 'student';

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await StudySyncStore.register({
        full_name: fullName,
        username,
        email,
        password,
        role,
        expertise: role === 'mentor' ? ['Computer Science', 'Mathematics'] : undefined,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Smooth redirection to role dashboard
      router.push(`/dashboard/${role}`);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during registration.');
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
          <h1 className="text-2xl font-black text-gray-900">Create StudySync Account</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Dynamic registration with live role-based portal access
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
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Aurelia Bennett"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1">
              Username *
            </label>
            <input
              type="text"
              placeholder="e.g. AureliaCodes"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1">
              Password *
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1">
              Choose Workspace Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 text-xs font-black text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
              required
            >
              <option value="student">🎓 Student (Browse, Bookmark, Ask Doubts, Book Sessions)</option>
              <option value="mentor">👨‍🏫 Mentor / Note Uploader (Upload Notes, Solve Doubts, Accept Sessions)</option>
              <option value="admin">👨‍💼 Administrator (Curation, User Control, Academic Subjects)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-tactile btn-tactile-green py-3 text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Workspace...' : 'Register & Enter Workspace'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t-2 border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-black text-duo-green hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
