'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark as BookmarkIcon,
  Trash2,
  Download,
  BookOpen,
  ArrowRight,
  Star,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Bookmark, Profile } from '@/types';

export default function BookmarksPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const user = StudySyncStore.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setBookmarks(StudySyncStore.getBookmarks(user.id));
    } else {
      setBookmarks([]);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    window.addEventListener('studysync_storage_update', loadData);
    return () => window.removeEventListener('studysync_storage_update', loadData);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickRemove = (noteId: string, noteTitle?: string) => {
    if (!currentUser) return;

    // Smooth client state update without full page reload
    setBookmarks((prev) => prev.filter((b) => b.note_id !== noteId));
    StudySyncStore.removeBookmark(currentUser.id, noteId);
    showToast(`🗑️ Removed "${noteTitle || 'note'}" from bookmarks.`);
  };

  const handleDownload = (noteId: string, fileUrl: string, fileName: string) => {
    StudySyncStore.incrementDownload(noteId);
    showToast(`Downloading ${fileName}...`);
    window.open(fileUrl, '_blank');
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="card-duo p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-duo-purple tracking-wider">
            Personal Study Binder
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            My Saved Bookmarks
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Fast access to your bookmarked notes, formulas, and cheat sheets.
          </p>
        </div>

        <Link
          href="/notes/browse"
          className="btn-tactile btn-tactile-outline px-4 py-2.5 text-xs font-bold rounded-xl self-start sm:self-center"
        >
          Explore More Notes &rarr;
        </Link>
      </div>

      {/* Unauthenticated notice */}
      {!currentUser ? (
        <div className="card-duo p-12 text-center bg-white">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-duo-purple flex items-center justify-center mx-auto mb-3">
            <BookmarkIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-base text-gray-800">Sign in to view saved bookmarks</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Bookmarked materials are saved securely in your dynamic student profile.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/login?redirect=/bookmarks"
              className="btn-tactile btn-tactile-outline px-4 py-2 text-xs font-bold rounded-xl"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-tactile btn-tactile-green px-4 py-2 text-xs font-bold rounded-xl"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : bookmarks.length === 0 ? (
        /* Empty State */
        <div className="card-duo p-12 text-center bg-white">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <BookmarkIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-base text-gray-800">Your binder is empty</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You haven&apos;t bookmarked any notes yet. Browse the public repository and tap the bookmark icon on any note.
          </p>
          <Link
            href="/notes/browse"
            className="mt-4 inline-block btn-tactile btn-tactile-purple px-5 py-2 text-xs font-bold rounded-xl bg-duo-purple text-white border-2 border-purple-700"
          >
            Browse Study Notes
          </Link>
        </div>
      ) : (
        /* Bookmarks Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bm) => {
            const note = bm.note;
            if (!note) return null;

            return (
              <div
                key={bm.id}
                className="card-duo p-5 bg-white flex flex-col justify-between hover:border-gray-400 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-duo-purple/10 text-duo-purple border border-duo-purple/20">
                      {note.subject_name || 'Academic'}
                    </span>
                    <button
                      onClick={() => handleQuickRemove(note.id, note.title)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Quick remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-black text-base text-gray-900 group-hover:text-duo-purple transition-colors leading-snug">
                    {note.title}
                  </h3>

                  <p className="text-xs text-gray-500 font-medium mt-2 line-clamp-3 leading-relaxed">
                    {note.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
                    <span className="flex items-center gap-1 font-bold">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {note.uploader_name}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{note.average_rating > 0 ? note.average_rating : 'New'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400">
                      {note.file_size}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(note.id, note.file_url, note.file_name)}
                        className="btn-tactile btn-tactile-outline px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
