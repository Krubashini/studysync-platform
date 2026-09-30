'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  MessageSquare,
  Bookmark as BookmarkIcon,
  Search,
  ShieldAlert,
  Flame,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  FolderPlus,
  CheckSquare,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Profile } from '@/types';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setCurrentUser(StudySyncStore.getCurrentUser());
    update();

    window.addEventListener('studysync_storage_update', update);
    return () => window.removeEventListener('studysync_storage_update', update);
  }, []);

  const handleLogout = async () => {
    await StudySyncStore.logout();
    router.push('/login');
  };

  // If on pure landing page /login /register, hide sidebar on desktop for a cleaner full-screen experience
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';

  if (!mounted) return null;
  if (isAuthPage || (isLandingPage && !currentUser)) return null;

  // Build navigation items based on role
  let navItems: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    color: string;
    activeBg: string;
    badge?: string;
  }> = [];

  if (!currentUser) {
    // Guest Navigation
    navItems = [
      {
        label: 'Home',
        href: '/',
        icon: <Home className="w-5 h-5 stroke-[2.2]" />,
        color: '#58CC02',
        activeBg: 'bg-[#EBFAD7] text-[#46A302] border-[#58CC02]',
      },
      {
        label: 'Browse Notes',
        href: '/notes/browse',
        icon: <BookOpen className="w-5 h-5 stroke-[2.2]" />,
        color: '#1CB0F6',
        activeBg: 'bg-[#E1F5FE] text-[#0288D1] border-[#1CB0F6]',
      },
      {
        label: 'Mentor Directory',
        href: '/mentors/profiles',
        icon: <Users className="w-5 h-5 stroke-[2.2]" />,
        color: '#FF9600',
        activeBg: 'bg-[#FFF3E0] text-[#E65100] border-[#FF9600]',
      },
      {
        label: 'Q&A Lounge',
        href: '/qa',
        icon: <MessageSquare className="w-5 h-5 stroke-[2.2]" />,
        color: '#CE82FF',
        activeBg: 'bg-[#F3E5F5] text-[#8E24AA] border-[#CE82FF]',
      },
    ];
  } else if (currentUser.role === 'student') {
    navItems = [
      {
        label: 'Student Portal',
        href: '/dashboard/student',
        icon: <Home className="w-5 h-5 stroke-[2.2]" />,
        color: '#58CC02',
        activeBg: 'bg-[#EBFAD7] text-[#46A302] border-[#58CC02]',
      },
      {
        label: 'Browse Notes',
        href: '/notes/browse',
        icon: <BookOpen className="w-5 h-5 stroke-[2.2]" />,
        color: '#1CB0F6',
        activeBg: 'bg-[#E1F5FE] text-[#0288D1] border-[#1CB0F6]',
      },
      {
        label: 'My Bookmarks',
        href: '/bookmarks',
        icon: <BookmarkIcon className="w-5 h-5 stroke-[2.2]" />,
        color: '#CE82FF',
        activeBg: 'bg-[#F3E5F5] text-[#8E24AA] border-[#CE82FF]',
      },
      {
        label: 'Doubt Solver',
        href: '/qa',
        icon: <MessageSquare className="w-5 h-5 stroke-[2.2]" />,
        color: '#FF9600',
        activeBg: 'bg-[#FFF3E0] text-[#E65100] border-[#FF9600]',
      },
      {
        label: 'Find Mentors',
        href: '/mentors/profiles',
        icon: <Users className="w-5 h-5 stroke-[2.2]" />,
        color: '#78D933',
        activeBg: 'bg-[#EBFAD7] text-[#46A302] border-[#78D933]',
      },
      {
        label: 'Global Search',
        href: '/search',
        icon: <Search className="w-5 h-5 stroke-[2.2]" />,
        color: '#1CB0F6',
        activeBg: 'bg-[#E1F5FE] text-[#0288D1] border-[#1CB0F6]',
      },
    ];
  } else if (currentUser.role === 'mentor') {
    navItems = [
      {
        label: 'Mentor Portal',
        href: '/dashboard/mentor',
        icon: <Sparkles className="w-5 h-5 stroke-[2.2]" />,
        color: '#FF9600',
        activeBg: 'bg-[#FFF3E0] text-[#E65100] border-[#FF9600]',
      },
      {
        label: 'Resource Factory',
        href: '/notes',
        icon: <FolderPlus className="w-5 h-5 stroke-[2.2]" />,
        color: '#58CC02',
        activeBg: 'bg-[#EBFAD7] text-[#46A302] border-[#58CC02]',
      },
      {
        label: 'Solver Desk (Q&A)',
        href: '/qa',
        icon: <MessageSquare className="w-5 h-5 stroke-[2.2]" />,
        color: '#1CB0F6',
        activeBg: 'bg-[#E1F5FE] text-[#0288D1] border-[#1CB0F6]',
      },
      {
        label: 'Booking Hub',
        href: '/dashboard/mentor#sessions',
        icon: <Calendar className="w-5 h-5 stroke-[2.2]" />,
        color: '#78D933',
        activeBg: 'bg-[#EBFAD7] text-[#46A302] border-[#78D933]',
      },
      {
        label: 'Browse Catalog',
        href: '/notes/browse',
        icon: <BookOpen className="w-5 h-5 stroke-[2.2]" />,
        color: '#CE82FF',
        activeBg: 'bg-[#F3E5F5] text-[#8E24AA] border-[#CE82FF]',
      },
    ];
  } else if (currentUser.role === 'admin') {
    navItems = [
      {
        label: 'Control Center',
        href: '/dashboard/admin',
        icon: <ShieldAlert className="w-5 h-5 stroke-[2.2]" />,
        color: '#EA2B2B',
        activeBg: 'bg-[#FFEBEE] text-[#C62828] border-[#EA2B2B]',
      },
      {
        label: 'User Accounts',
        href: '/admin/users',
        icon: <Users className="w-5 h-5 stroke-[2.2]" />,
        color: '#1CB0F6',
        activeBg: 'bg-[#E1F5FE] text-[#0288D1] border-[#1CB0F6]',
      },
      {
        label: 'Content Curation',
        href: '/admin/notes',
        icon: <CheckSquare className="w-5 h-5 stroke-[2.2]" />,
        color: '#FF9600',
        activeBg: 'bg-[#FFF3E0] text-[#E65100] border-[#FF9600]',
      },
      {
        label: 'Academic Subjects',
        href: '/dashboard/admin#subjects',
        icon: <BookOpen className="w-5 h-5 stroke-[2.2]" />,
        color: '#58CC02',
        activeBg: 'bg-[#EBFAD7] text-[#46A302] border-[#58CC02]',
      },
    ];
  }

  return (
    <>
      {/* Permanent Desktop Wide Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen fixed left-0 top-0 bg-white border-r-2 border-[#E5E5E5] z-30 select-none">
        {/* Brand Logo */}
        <div className="p-5 pb-4 flex items-center justify-between border-b-2 border-[#F0F0F0]">
          <Link href={currentUser ? `/dashboard/${currentUser.role}` : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-duo-green flex items-center justify-center text-white border-b-2 border-duo-green-dark shadow-sm">
              <span className="text-xl">🦉</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-duo-green">
                  StudySync
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Peer Learning Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Destination Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 px-3 pb-1">
            {currentUser ? `${currentUser.role.toUpperCase()} WORKSPACE` : 'PUBLIC DIRECTORY'}
          </div>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && item.href !== '/notes' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                  isActive
                    ? `${item.activeBg} border-b-3`
                    : 'text-gray-600 hover:bg-gray-50 border-transparent hover:border-[#E5E5E5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: isActive ? 'inherit' : item.color }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-duo-red text-white uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Auth Actions */}
        <div className="p-4 border-t-2 border-[#E5E5E5] bg-[#FCFCFC]">
          {currentUser ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E5E5] object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900 truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                        currentUser.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : currentUser.role === 'mentor'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      ★ {currentUser.reputation} pts
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-gray-600 hover:text-red-600 bg-white border-2 border-[#E5E5E5] hover:border-red-200 transition-colors active:translate-y-[1px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-duo-green bg-white border-2 border-duo-green/40 hover:border-duo-green transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-duo-green hover:bg-duo-green-dark border-2 border-duo-green-dark transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E5E5] px-2 py-1.5 flex items-center justify-around z-40">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center p-1.5 rounded-lg text-xs font-bold ${
                isActive ? 'text-duo-green' : 'text-gray-500'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
