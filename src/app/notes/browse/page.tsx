'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Download,
  Star,
  Bookmark as BookmarkIcon,
  Filter,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Note, Subject, Profile } from '@/types';

export default function BrowseNotesPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setCurrentUser(StudySyncStore.getCurrentUser());
    setNotes(StudySyncStore.getApprovedNotes());
    setSubjects(StudySyncStore.getSubjects());
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

  const handleDownload = (note: Note) => {
    StudySyncStore.incrementDownload(note.id);
    showToast(`Downloading "${note.title}" (${note.file_name})`);
    // Open file url in new tab
    window.open(note.file_url, '_blank');
  };

  const handleBookmarkToggle = (note: Note) => {
    if (!currentUser) {
      showToast('⚠️ Please sign in or register to bookmark study notes.');
      return;
    }
    const added = StudySyncStore.toggleBookmark(currentUser.id, note.id);
    showToast(added ? '🌸 Saved note to your bookmarks!' : 'Removed from bookmarks.');
  };

  const handleRate = (note: Note, stars: number) => {
    if (!currentUser) {
      showToast('⚠️ Please sign in to rate this study note.');
      return;
    }
    StudySyncStore.rateNote(note.id, stars);
    showToast(`⭐ You rated "${note.title}" ${stars} stars!`);
  };

  if (!mounted) return null;

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSubject =
      selectedSubject === 'all' || n.subject_id === selectedSubject;
    const matchesQuery =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subject_name && n.subject_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.uploader_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="card-duo p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-duo-green tracking-wider">
            Public Academic Repository
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Browse Approved Study Notes
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            High-yield lecture summaries, verified cheat sheets, and problem sets reviewed by academic admins.
          </p>
        </div>

        {currentUser?.role === 'mentor' && (
          <Link
            href="/notes"
            className="btn-tactile btn-tactile-green px-4 py-2.5 text-xs font-bold rounded-xl self-start md:self-center"
          >
            + Upload New Note
          </Link>
        )}
      </div>

      {/* Search & Subject Filters */}
      <div className="card-duo p-4 bg-white flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes by title, topic, or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
          />
        </div>

        {/* Subject pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all whitespace-nowrap ${
              selectedSubject === 'all'
                ? 'bg-duo-green text-white border-duo-green-dark'
                : 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-300'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all whitespace-nowrap ${
                selectedSubject === sub.id
                  ? 'bg-duo-green text-white border-duo-green-dark'
                  : 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-300'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="card-duo p-12 text-center bg-white">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-base text-gray-800">No notes found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {notes.length === 0
              ? 'No notes have been uploaded and approved yet. Mentors can upload study resources from their dashboard.'
              : 'Try adjusting your search keywords or subject filter.'}
          </p>
          {currentUser?.role === 'mentor' && (
            <Link
              href="/notes"
              className="mt-4 inline-block btn-tactile btn-tactile-green px-4 py-2 text-xs font-bold rounded-xl"
            >
              Upload the First Note
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const isBookmarked = currentUser
              ? StudySyncStore.isBookmarked(currentUser.id, note.id)
              : false;

            return (
              <div
                key={note.id}
                className="card-duo p-5 bg-white flex flex-col justify-between hover:border-gray-400 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-duo-green/10 text-duo-green border border-duo-green/20">
                      {note.subject_name || 'Academic'}
                    </span>
                    <button
                      onClick={() => handleBookmarkToggle(note)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isBookmarked
                          ? 'bg-purple-50 text-duo-purple border-duo-purple'
                          : 'text-gray-400 border-transparent hover:border-gray-200 hover:text-gray-600'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this note'}
                    >
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-black text-base text-gray-900 group-hover:text-duo-green transition-colors leading-snug">
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
                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRate(note, star)}
                            className="hover:scale-125 transition-transform"
                            title={`Rate ${star} stars`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                star <= Math.round(note.average_rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="font-extrabold text-gray-700 ml-1">
                        {note.average_rating > 0 ? note.average_rating : 'New'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400">
                      {note.downloads_count} downloads &bull; {note.file_size}
                    </span>
                    <button
                      onClick={() => handleDownload(note)}
                      className="btn-tactile btn-tactile-outline px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
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
