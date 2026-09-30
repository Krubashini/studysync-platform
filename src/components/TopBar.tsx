'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Flame,
  Sparkles,
  CheckCheck,
  Trash2,
  ExternalLink,
  ChevronDown,
  Search,
  User,
  LogOut,
  Shield,
  BookOpen,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Notification, Profile, UserRole } from '@/types';

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    const user = StudySyncStore.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setNotifications(StudySyncStore.getNotifications(user.id));
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    setMounted(true);
    refreshData();

    window.addEventListener('studysync_storage_update', refreshData);
    return () => window.removeEventListener('studysync_storage_update', refreshData);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      StudySyncStore.markAllNotificationsRead(currentUser.id);
      refreshData();
    }
  };

  const handleClearAll = () => {
    if (currentUser) {
      StudySyncStore.clearNotifications(currentUser.id);
      refreshData();
    }
  };

  const handleLogout = async () => {
    await StudySyncStore.logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#E5E5E5] px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Mobile Title / Logo */}
      <div className="flex items-center gap-3">
        <Link href={currentUser ? `/dashboard/${currentUser.role}` : '/'} className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-duo-green flex items-center justify-center text-white border-b-2 border-duo-green-dark">
            <span className="text-base">🦉</span>
          </div>
          <span className="font-black text-lg text-duo-green">StudySync</span>
        </Link>

        {/* Breadcrumb or context title */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500">
          <span className="text-gray-400">StudySync</span>
          <span>/</span>
          <span className="text-gray-900 capitalize font-extrabold">
            {pathname.split('/')[1] || 'Home'}
          </span>
          {pathname.split('/')[2] && (
            <>
              <span>/</span>
              <span className="text-duo-green capitalize">{pathname.split('/')[2]}</span>
            </>
          )}
        </div>
      </div>

      {/* Right Stats & Hubs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentUser ? (
          <>
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#E5E5E5] hover:border-duo-orange/50 transition-all cursor-default"
              title={`${currentUser.streak_count} Days Streak`}
            >
              <Flame className="w-4 h-4 text-duo-orange fill-duo-orange" />
              <span className="font-extrabold text-xs text-duo-orange">
                {currentUser.streak_count}d
              </span>
            </div>

            {/* Reputation Points */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#E5E5E5] hover:border-duo-blue/50 transition-all cursor-default"
              title={`${currentUser.reputation} Reputation Points`}
            >
              <Sparkles className="w-4 h-4 text-duo-blue fill-duo-blue" />
              <span className="font-extrabold text-xs text-duo-blue">
                {currentUser.reputation} pts
              </span>
            </div>

            {/* Notification Hub Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2 rounded-xl border-2 transition-all active:translate-y-[1px] ${
                  showNotifs
                    ? 'bg-duo-blue/10 border-duo-blue text-duo-blue'
                    : 'bg-white border-[#E5E5E5] text-gray-600 hover:border-gray-300'
                }`}
                title="Notifications Hub"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-duo-red text-white text-[10px] font-black flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 bg-gray-50 border-b-2 border-[#E5E5E5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-duo-blue text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-duo-green hover:underline flex items-center gap-1"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Read All
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="text-[11px] font-bold text-gray-400 hover:text-red-500"
                          title="Clear all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-xs font-bold">
                        🌸 All caught up! No notifications right now.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs transition-colors hover:bg-gray-50 ${
                            !notif.is_read ? 'bg-blue-50/40 font-semibold' : 'text-gray-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="leading-snug text-gray-800">{notif.message}</p>
                            {!notif.is_read && (
                              <button
                                onClick={() => {
                                  StudySyncStore.markNotificationRead(notif.id);
                                  refreshData();
                                }}
                                className="text-[10px] text-duo-blue font-bold hover:underline shrink-0"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white border-2 border-[#E5E5E5] hover:border-gray-300 transition-all active:translate-y-[1px]"
              >
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.username}
                  className="w-6 h-6 rounded-lg bg-gray-100 border border-gray-200 object-cover"
                />
                <span className="hidden sm:inline text-xs font-bold text-gray-800">
                  {currentUser.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border-2 border-[#E5E5E5] rounded-xl shadow-xl z-50 p-2 text-xs font-bold space-y-1">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-gray-900 font-extrabold truncate">{currentUser.full_name}</p>
                    <p className="text-gray-400 text-[11px] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 uppercase font-black">
                      {currentUser.role}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/${currentUser.role}`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    My Dashboard
                  </Link>
                  <Link
                    href="/bookmarks"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    My Bookmarks
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Guest Experience Navigation in TopBar */
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/notes/browse"
              className="text-xs font-bold text-gray-600 hover:text-duo-green px-2.5 py-1.5"
            >
              Browse Notes
            </Link>
            <Link
              href="/mentors/profiles"
              className="hidden sm:inline text-xs font-bold text-gray-600 hover:text-duo-green px-2.5 py-1.5"
            >
              Find Mentors
            </Link>
            <Link
              href="/login"
              className="btn-tactile btn-tactile-outline px-3 py-1.5 text-xs font-bold rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-tactile btn-tactile-green px-3.5 py-1.5 text-xs font-bold rounded-lg"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
