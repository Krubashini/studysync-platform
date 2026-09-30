'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  Filter,
  Flame,
  Sparkles,
  ArrowLeft,
  CheckSquare,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Profile, UserRole } from '@/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadProfiles = () => {
    const user = StudySyncStore.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=/admin/users');
      return;
    }
    if (user.role !== 'admin') {
      router.push(`/dashboard/${user.role}?error=unauthorized`);
      return;
    }

    setCurrentUser(user);
    setProfiles(StudySyncStore.getProfiles());
  };

  useEffect(() => {
    setMounted(true);
    loadProfiles();

    window.addEventListener('studysync_storage_update', loadProfiles);
    return () => window.removeEventListener('studysync_storage_update', loadProfiles);
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    StudySyncStore.updateUserRole(userId, newRole);
    showToast(`✓ User role updated to ${newRole.toUpperCase()}!`);
    loadProfiles();
  };

  const handleToggleStatus = (userId: string, currentDisabled: boolean) => {
    StudySyncStore.toggleUserStatus(userId);
    showToast(
      currentDisabled
        ? '✓ Account has been re-activated!'
        : '⚠️ Account access has been provisionally disabled.'
    );
    loadProfiles();
  };

  if (!mounted || !currentUser) return null;

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="card-duo p-6 md:p-8 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/admin"
              className="text-xs font-bold text-duo-blue hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Control Center
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            User Management &amp; Access Roles
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Audit registered accounts, elevate peers to mentors, adjust administrator roles, or toggle account flags.
          </p>
        </div>

        <Link
          href="/admin/notes"
          className="btn-tactile btn-tactile-orange px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Moderation Queue &rarr;</span>
        </Link>
      </div>

      {/* Search & Role Filters Bar */}
      <div className="card-duo p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Lookup by name, username, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-[#E5E5E5] font-bold text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-duo-blue bg-[#F9FAFB]"
          />
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Role:
          </span>
          {(['all', 'student', 'mentor', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-colors border-2 ${
                roleFilter === r
                  ? 'bg-duo-blue text-white border-duo-blue-dark'
                  : 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive User Accounts Table */}
      <div className="card-duo bg-white overflow-hidden">
        {filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs font-bold">
            No user accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#E5E5E5] bg-gray-50/70 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4">Profile</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Workspace Role</th>
                  <th className="py-3 px-4">Stats</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold">
                {filteredProfiles.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-9 h-9 rounded-xl border border-gray-200 object-cover bg-gray-50"
                        />
                        <div>
                          <div className="font-black text-gray-900">{user.full_name}</div>
                          <div className="text-[11px] text-gray-400 font-medium">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{user.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border-2 focus:outline-none cursor-pointer ${
                          user.role === 'admin'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : user.role === 'mentor'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-extrabold text-duo-orange">
                          <Flame className="w-3.5 h-3.5 fill-duo-orange" /> {user.streak_count}d
                        </span>
                        <span className="flex items-center gap-1 font-extrabold text-duo-blue">
                          <Sparkles className="w-3.5 h-3.5 fill-duo-blue" /> {user.reputation} pts
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.is_disabled ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                          Disabled
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_disabled)}
                        className={`btn-tactile px-3 py-1 text-xs font-bold rounded-lg ${
                          user.is_disabled
                            ? 'btn-tactile-green'
                            : 'btn-tactile-outline text-red-600 hover:border-red-300'
                        }`}
                      >
                        {user.is_disabled ? 'Enable' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
