'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Star,
  Sparkles,
  Calendar,
  FolderPlus,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  Send,
  User,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { UploadNoteModal } from '@/components/UploadNoteModal';
import { Profile, Note, Question, SessionRequest } from '@/types';

export default function MentorDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [inlineAnswerContent, setInlineAnswerContent] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const user = StudySyncStore.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=/dashboard/mentor');
      return;
    }
    if (user.role !== 'mentor' && user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    setCurrentUser(user);
    setMyNotes(StudySyncStore.getNotesByUploader(user.id));
    setUnansweredQuestions(StudySyncStore.getQuestions().filter((q) => q.answers_count === 0));
    setSessionRequests(StudySyncStore.getSessions(user.id, 'mentor'));
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

  const handleDeleteNote = (noteId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      StudySyncStore.deleteNote(noteId);
      showToast(`🗑️ Note "${title}" removed.`);
    }
  };

  const handlePostAnswer = (questionId: string) => {
    if (!inlineAnswerContent.trim() || !currentUser) return;

    StudySyncStore.createAnswer({
      question_id: questionId,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_role: 'mentor',
      content: inlineAnswerContent.trim(),
    });

    showToast('💡 Answer published and student notified!');
    setInlineAnswerContent('');
    setActiveQuestionId(null);
  };

  const handleSessionAction = (sessionId: string, status: 'accepted' | 'rejected') => {
    StudySyncStore.updateSessionStatus(sessionId, status);
    showToast(`Session invitation has been ${status}.`);
  };

  if (!mounted || !currentUser) return null;

  // Aggregate Metrics Calculations
  const totalDownloads = myNotes.reduce((acc, n) => acc + (n.downloads_count || 0), 0);
  const ratedNotes = myNotes.filter((n) => n.ratings_count > 0);
  const averageRating =
    ratedNotes.length > 0
      ? (
          ratedNotes.reduce((acc, n) => acc + n.average_rating, 0) / ratedNotes.length
        ).toFixed(1)
      : '5.0';
  const pendingSessions = sessionRequests.filter((s) => s.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Mentor Header */}
      <div className="card-duo p-6 md:p-8 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name}
            className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-[#E5E5E5] object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-700 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300">
                Verified Mentor &amp; Uploader
              </span>
              <span className="text-xs font-bold text-gray-400">
                @{currentUser.username}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Welcome to Creator Studio, {currentUser.full_name}!
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Empower fellow students by uploading curriculum notes and answering technical doubts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-tactile btn-tactile-green px-5 py-3 text-xs font-black rounded-xl shadow-sm flex items-center gap-2 self-start md:self-center"
        >
          <FolderPlus className="w-4 h-4 stroke-[3]" />
          <span>Upload New Note</span>
        </button>
      </div>

      {/* Creator Metrics Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Downloads */}
        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Note Downloads</span>
            <Download className="w-4 h-4 text-duo-blue" />
          </div>
          <div className="text-3xl font-black text-gray-900">{totalDownloads}</div>
          <span className="text-[11px] font-bold text-gray-400 mt-1 block">Across all uploaded materials</span>
        </div>

        {/* Metric 2: Rating */}
        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Average Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-3xl font-black text-gray-900 flex items-center gap-1.5">
            <span>{averageRating}</span>
            <span className="text-sm text-amber-500">★</span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 mt-1 block">Student peer feedback</span>
        </div>

        {/* Metric 3: Reputation */}
        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Mentor Reputation</span>
            <Sparkles className="w-4 h-4 text-duo-orange" />
          </div>
          <div className="text-3xl font-black text-gray-900">{currentUser.reputation}</div>
          <span className="text-[11px] font-bold text-gray-400 mt-1 block">Earned via notes &amp; answers</span>
        </div>

        {/* Metric 4: Pending Sessions */}
        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Session Invites</span>
            <Calendar className="w-4 h-4 text-duo-green" />
          </div>
          <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <span>{pendingSessions.length}</span>
            {pendingSessions.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                Pending
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-gray-400 mt-1 block">1-on-1 requests</span>
        </div>
      </div>

      {/* Resource Factory: Uploaded Notes Table / CRUD */}
      <div className="card-duo p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">Resource Factory (My Uploaded Notes)</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage your published cheat sheets, lecture summaries, and pending moderation items.
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-tactile btn-tactile-outline px-3.5 py-1.5 text-xs font-bold rounded-lg self-start sm:self-center"
          >
            + Add Another Resource
          </button>
        </div>

        {myNotes.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500">You haven&apos;t uploaded any study notes yet.</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-3 btn-tactile btn-tactile-green px-4 py-2 text-xs font-bold rounded-xl"
            >
              Upload Your First Resource
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-400 uppercase font-black text-[10px]">
                  <th className="py-3 px-3">Title &amp; File</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Downloads</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold">
                {myNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-black text-gray-900">{note.title}</div>
                      <div className="text-[11px] text-gray-400 font-medium">{note.file_name} ({note.file_size})</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-extrabold text-gray-600">
                        {note.subject_name || 'Academic'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {note.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {note.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {note.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-800" title={note.rejection_reason}>
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {note.downloads_count}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{note.average_rating > 0 ? note.average_rating : '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Solver Desk: Feed of Unanswered Questions */}
      <div className="card-duo p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-duo-blue" />
              <h2 className="text-lg font-black text-gray-900">Interactive Solver Desk</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Unanswered student doubts awaiting peer mentor verified explanations.
            </p>
          </div>
          <Link href="/qa" className="text-xs font-bold text-duo-blue hover:underline">
            View All Q&A &rarr;
          </Link>
        </div>

        {unansweredQuestions.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-xs font-bold text-gray-500">✨ Great work! All community questions currently have answers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unansweredQuestions.slice(0, 3).map((q) => {
              const isReplying = activeQuestionId === q.id;

              return (
                <div key={q.id} className="p-4 rounded-xl border-2 border-[#E5E5E5] bg-[#F9FAFB] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-duo-blue">
                      {q.subject_name || 'Academic'}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      Asked by {q.student_name}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-gray-900">{q.title}</h4>
                    <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">{q.description}</p>
                  </div>

                  {isReplying ? (
                    <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                      <label className="block text-[11px] font-black uppercase text-gray-500">
                        Write Verified Explanation
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide clear step-by-step reasoning or mathematical formulas..."
                        value={inlineAnswerContent}
                        onChange={(e) => setInlineAnswerContent(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-[#E5E5E5] font-medium text-xs bg-white focus:outline-none focus:border-duo-blue"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveQuestionId(null);
                            setInlineAnswerContent('');
                          }}
                          className="btn-tactile btn-tactile-outline px-3 py-1.5 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePostAnswer(q.id)}
                          className="btn-tactile btn-tactile-blue px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          Publish Verified Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveQuestionId(q.id);
                        setInlineAnswerContent('');
                      }}
                      className="btn-tactile btn-tactile-blue px-3.5 py-1.5 text-xs font-bold rounded-lg"
                    >
                      Answer Question (+15 pts)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Hub: 1-on-1 Sessions */}
      <div id="sessions" className="card-duo p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-duo-orange" />
              <h2 className="text-lg font-black text-gray-900">1-on-1 Mentorship Booking Hub</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Review and respond to incoming study sync session requests from students.
            </p>
          </div>
          <span className="text-xs font-extrabold text-gray-400">
            {sessionRequests.length} total requests
          </span>
        </div>

        {sessionRequests.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-xs font-bold text-gray-500">No session requests yet. Students can book sessions from your mentor profile.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionRequests.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl border-2 border-[#E5E5E5] bg-[#F9FAFB] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-gray-900">{sess.student_name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {sess.subject_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(sess.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  {sess.notes && (
                    <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded-lg border border-gray-200">
                      &quot;{sess.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {sess.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleSessionAction(sess.id, 'accepted')}
                        className="btn-tactile btn-tactile-green px-4 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleSessionAction(sess.id, 'rejected')}
                        className="btn-tactile btn-tactile-red px-3.5 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-lg border uppercase ${
                        sess.status === 'accepted'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {sess.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Note Modal */}
      <UploadNoteModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          loadData();
          showToast('🌸 Note submitted! An admin will review it shortly.');
        }}
      />
    </div>
  );
}
