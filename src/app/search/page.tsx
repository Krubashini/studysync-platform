'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  FileText,
  HelpCircle,
  X,
  ExternalLink,
  ArrowRight,
  Bookmark as BookmarkIcon,
  CheckCircle,
  GraduationCap,
  Star,
  Download,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { SearchResults, Note } from '@/types';
import { triggerConfetti } from '@/components/Confetti';

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('Computer Science');
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'subjects' | 'questions' | 'mentors'>('all');
  const [results, setResults] = useState<SearchResults>({
    notes: [],
    subjects: [],
    questions: [],
    mentors: [],
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const performSearch = (q: string) => {
    const res = StudySyncStore.globalSearch(q);
    setResults(res);
  };

  const loadBookmarks = () => {
    const bms = StudySyncStore.getBookmarks();
    setBookmarkedIds(bms.map((b) => b.note_id));
  };

  useEffect(() => {
    loadBookmarks();
    performSearch(query);

    const onUpdate = () => {
      loadBookmarks();
      performSearch(query);
    };

    window.addEventListener('studysync_storage_update', onUpdate);
    return () => window.removeEventListener('studysync_storage_update', onUpdate);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQ = e.target.value;
    setQuery(newQ);
    performSearch(newQ);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    performSearch(tag);
  };

  const toggleBookmark = (note: Note) => {
    const isNowSaved = StudySyncStore.toggleBookmark(note);
    loadBookmarks();
    if (isNowSaved) {
      triggerConfetti();
      showToast(`🔖 Saved "${note.title.substring(0, 30)}..." to Bookmarks!`);
    } else {
      showToast(`Removed from Bookmarks.`);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const totalCount =
    results.notes.length +
    results.subjects.length +
    results.questions.length +
    (results.mentors?.length || 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border-2 border-emerald-500 flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-bottom-3">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Global Search Bar */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs uppercase tracking-wider border border-emerald-200">
            Omni-Search Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
            Search Across <span className="text-emerald-600">Everything</span>
          </h1>
          <p className="text-stone-500 font-medium text-sm">
            Instant multi-module query across verified peer notes, academic curriculums, student doubts, and verified mentors.
          </p>

          {/* Search Input Box */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search by topic, keyword, subject, e.g. Mathematics, Physics, Recursion..."
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-stone-200 focus:border-emerald-500 focus:outline-none text-base font-bold text-stone-800 placeholder-stone-400 transition-colors shadow-inner"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  performSearch('');
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Suggestion Tags */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2 text-xs font-bold text-stone-500">
            <span>Quick Topics:</span>
            {['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-stone-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <span>All Results</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/15 font-black">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Study Notes</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/15 font-black">
            {results.notes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'subjects'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/15 font-black">
            {results.subjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Q&amp;A Doubts</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/15 font-black">
            {results.questions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'mentors'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Mentors</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/15 font-black">
            {results.mentors?.length || 0}
          </span>
        </button>
      </div>

      {/* Tab Content Display */}
      {totalCount === 0 ? (
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-12 text-center space-y-4">
          <span className="text-5xl block">🔍📚</span>
          <h3 className="text-xl font-bold text-stone-800">
            No matching learning resources found
          </h3>
          <p className="text-stone-500 font-medium text-sm max-w-md mx-auto">
            We couldn&apos;t locate any verified notes, subjects, or discussions matching &ldquo;{query}&rdquo;. Try another topic or explore our core curriculum.
          </p>
          <button
            onClick={() => handleTagClick('Computer Science')}
            className="btn-tactile bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm inline-block"
          >
            Search &ldquo;Computer Science&rdquo;
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION: SUBJECTS */}
          {(activeTab === 'all' || activeTab === 'subjects') && results.subjects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-stone-800 uppercase tracking-wide">
                  Matching Subjects ({results.subjects.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-5 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm"
                        style={{ backgroundColor: sub.color || '#F59E0B' }}
                      >
                        {sub.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-stone-800">
                          {sub.name}
                        </h4>
                        <p className="text-xs text-stone-500 font-medium line-clamp-1 mt-0.5">
                          {sub.description}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/notes/browse?subject=${sub.id}`}
                      className="btn-tactile bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1 border border-stone-300"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: STUDY NOTES */}
          {(activeTab === 'all' || activeTab === 'notes') && results.notes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-extrabold text-stone-800 uppercase tracking-wide">
                  Matching Study Notes ({results.notes.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.notes.map((note) => {
                  const isBookmarked = bookmarkedIds.includes(note.id);
                  return (
                    <div
                      key={note.id}
                      className="bg-white border-2 border-stone-200 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-400 transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                            {note.subject_name || 'Academic'}
                          </span>
                          <button
                            onClick={() => toggleBookmark(note)}
                            className={`p-1.5 rounded-xl border-2 transition-all ${
                              isBookmarked
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-stone-50 text-stone-400 border-stone-200 hover:text-amber-500'
                            }`}
                            title={isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                          >
                            <BookmarkIcon className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        <h4 className="font-extrabold text-base text-stone-800 group-hover:text-sky-600 transition-colors line-clamp-2">
                          {note.title}
                        </h4>

                        <p className="text-xs text-stone-500 font-medium line-clamp-3 mt-1.5">
                          {note.description}
                        </p>

                        <div className="flex items-center gap-3 mt-3 text-xs font-bold text-stone-500">
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{note.average_rating > 0 ? note.average_rating.toFixed(1) : 'New'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-stone-400">
                            <Download className="w-3.5 h-3.5" />
                            <span>{note.downloads_count}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-500">
                        <span>By {note.uploader_name}</span>
                        <a
                          href={note.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-tactile bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-xs"
                        >
                          <span>Open PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: Q&A DOUBTS */}
          {(activeTab === 'all' || activeTab === 'questions') && results.questions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-extrabold text-stone-800 uppercase tracking-wide">
                  Matching Discussions ({results.questions.length})
                </h3>
              </div>

              <div className="space-y-3">
                {results.questions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white border-2 border-stone-200 hover:border-orange-300 rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          {q.subject_name || 'Academic'}
                        </span>
                        {q.is_solved ? (
                          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Solved
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-stone-400">
                            {q.answers_count} Answers
                          </span>
                        )}
                      </div>

                      <Link href={`/qa/${q.id}`}>
                        <h4 className="font-extrabold text-base text-stone-800 group-hover:text-orange-600 transition-colors">
                          {q.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-stone-500 font-medium line-clamp-2">
                        {q.description}
                      </p>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-stone-100">
                      <span className="text-xs font-bold text-stone-400">
                        Asked by {q.student_name}
                      </span>
                      <Link
                        href={`/qa/${q.id}`}
                        className="btn-tactile bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1"
                      >
                        <span>Join Thread</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: MENTORS */}
          {(activeTab === 'all' || activeTab === 'mentors') && (results.mentors?.length || 0) > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-stone-800 uppercase tracking-wide">
                  Matching Mentors ({results.mentors?.length || 0})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.mentors?.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="bg-white border-2 border-stone-200 hover:border-indigo-400 rounded-2xl p-5 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.avatar_url}
                        alt={mentor.full_name}
                        className="w-12 h-12 rounded-full border-2 border-indigo-200 bg-stone-50"
                      />
                      <div>
                        <h4 className="font-extrabold text-base text-stone-800">
                          {mentor.full_name}
                        </h4>
                        <p className="text-xs text-stone-400 font-bold">
                          @{mentor.username} &bull; {mentor.reputation} Rep
                        </p>
                      </div>
                    </div>

                    {mentor.expertise && mentor.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {mentor.expertise.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <Link
                        href="/mentors/profiles"
                        className="btn-tactile w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold text-center block"
                      >
                        Book 1-on-1 Session
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
