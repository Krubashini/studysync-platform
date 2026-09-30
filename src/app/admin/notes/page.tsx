'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Users,
  Search,
  Download,
  AlertCircle,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Note, NoteStatus, Profile } from '@/types';

export default function AdminNotesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTrack, setActiveTrack] = useState<NoteStatus>('pending');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [rejectingNoteId, setRejectingNoteId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const user = StudySyncStore.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=/admin/notes');
      return;
    }
    if (user.role !== 'admin') {
      router.push(`/dashboard/${user.role}?error=unauthorized`);
      return;
    }

    setCurrentUser(user);
    const allNotes = StudySyncStore.getNotes();
    setNotes(allNotes);

    // Auto select first note if none selected
    if (!selectedNoteId && allNotes.length > 0) {
      const pendingFirst = allNotes.find((n) => n.status === 'pending');
      setSelectedNoteId(pendingFirst ? pendingFirst.id : allNotes[0].id);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    window.addEventListener('studysync_storage_update', loadData);
    return () => window.removeEventListener('studysync_storage_update', loadData);
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (noteId: string) => {
    StudySyncStore.approveNote(noteId);
    showToast('✓ Note approved and published across student feeds!');
    loadData();
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingNoteId) return;

    StudySyncStore.rejectNote(
      rejectingNoteId,
      rejectionReason.trim() || 'Content did not meet curriculum standards.'
    );
    setRejectingNoteId(null);
    setRejectionReason('');
    showToast('⚠️ Note rejected and author notified with feedback.');
    loadData();
  };

  if (!mounted || !currentUser) return null;

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesTrack = activeTrack === 'pending' ? n.status === 'pending' : n.status === activeTrack;
    const matchesQuery =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.uploader_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subject_name && n.subject_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrack && matchesQuery;
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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
              className="text-xs font-bold text-duo-orange hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Control Center
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Resource Verification &amp; Curation
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Single-click approval workflow. Approving items immediately publishes them across public and student feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((track) => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-black uppercase ${
                activeTrack === track
                  ? track === 'pending'
                    ? 'btn-tactile-orange'
                    : track === 'approved'
                    ? 'btn-tactile-green'
                    : 'btn-tactile-red'
                  : 'btn-tactile-outline'
              }`}
            >
              {track} ({notes.filter((n) => n.status === track).length})
            </button>
          ))}
        </div>
      </div>

      {/* Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Pane: Items List (5 Cols) */}
        <div className="lg:col-span-5 card-duo p-4 bg-white flex flex-col">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search queue by title or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-orange focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs font-bold">
                No items found in this category.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === selectedNoteId;

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-duo-orange bg-orange-50/30'
                        : 'border-[#E5E5E5] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-duo-orange">
                        {note.subject_name || 'Academic'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-black text-xs text-gray-900 line-clamp-1">{note.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-medium">
                      <span>By {note.uploader_name}</span>
                      <span>{note.file_size}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Detail & Moderation Actions (7 Cols) */}
        <div className="lg:col-span-7 card-duo p-6 bg-white flex flex-col justify-between">
          {selectedNote ? (
            <div>
              <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-gray-100">
                <div>
                  <span className="text-xs font-black uppercase text-duo-orange">
                    {selectedNote.subject_name || 'Academic'}
                  </span>
                  <h2 className="text-xl font-black text-gray-900 mt-1">{selectedNote.title}</h2>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">
                    Uploaded by <span className="text-gray-700 font-black">{selectedNote.uploader_name}</span> on{' '}
                    {new Date(selectedNote.created_at).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${
                    selectedNote.status === 'approved'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : selectedNote.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {selectedNote.status}
                </span>
              </div>

              {/* Description */}
              <div className="py-4 space-y-2">
                <span className="text-xs font-black uppercase text-gray-500">Curriculum Description:</span>
                <p className="text-xs text-gray-700 leading-relaxed font-medium bg-[#F9FAFB] p-3.5 rounded-xl border border-gray-200">
                  {selectedNote.description}
                </p>
              </div>

              {/* File Attachment Card */}
              <div className="p-3.5 rounded-xl border-2 border-[#E5E5E5] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-duo-blue flex items-center justify-center font-black text-xs">
                    PDF
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-900">{selectedNote.file_name}</div>
                    <div className="text-[10px] text-gray-400 font-bold">{selectedNote.file_size}</div>
                  </div>
                </div>

                <a
                  href={selectedNote.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile btn-tactile-outline px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview Document
                </a>
              </div>

              {selectedNote.rejection_reason && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <strong>Rejection Note:</strong> {selectedNote.rejection_reason}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold">
              Select an uploaded resource from the left pane to review.
            </div>
          )}

          {/* Action Bar */}
          {selectedNote && (
            <div className="pt-6 border-t-2 border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectingNoteId(selectedNote.id)}
                className="btn-tactile btn-tactile-red px-5 py-2.5 text-xs font-black rounded-xl flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject Resource
              </button>
              <button
                onClick={() => handleApprove(selectedNote.id)}
                className="btn-tactile btn-tactile-green px-6 py-2.5 text-xs font-black rounded-xl flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approve &amp; Publish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectingNoteId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-black text-gray-900 mb-1">State Rejection Rationale</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">
              Provide feedback for the mentor explaining why this note was declined.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                placeholder="e.g. Scanned pages are blurry or does not cover the official curriculum outline..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 text-xs font-medium text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-red focus:outline-none"
                required
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingNoteId(null)}
                  className="btn-tactile btn-tactile-outline px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-tactile btn-tactile-red px-5 py-2 text-xs font-bold rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
