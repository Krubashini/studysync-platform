'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  BookOpen,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Profile, Subject, Note } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Subject Config State
  const [newSubName, setNewSubName] = useState('');
  const [newSubSlug, setNewSubSlug] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubColor, setNewSubColor] = useState('#58CC02');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const user = StudySyncStore.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=/dashboard/admin');
      return;
    }
    if (user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    setCurrentUser(user);
    setProfiles(StudySyncStore.getProfiles());
    setNotes(StudySyncStore.getNotes());
    setSubjects(StudySyncStore.getSubjects());
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

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubSlug.trim() || !newSubDesc.trim()) return;

    StudySyncStore.createSubject({
      name: newSubName.trim(),
      slug: newSubSlug.trim().toLowerCase(),
      description: newSubDesc.trim(),
      color: newSubColor,
    });

    showToast(`🌸 Created global academic subject "${newSubName}"!`);
    setNewSubName('');
    setNewSubSlug('');
    setNewSubDesc('');
  };

  if (!mounted || !currentUser) return null;

  const pendingNotes = notes.filter((n) => n.status === 'pending');
  const approvedNotes = notes.filter((n) => n.status === 'approved');
  const studentCount = profiles.filter((p) => p.role === 'student').length;
  const mentorCount = profiles.filter((p) => p.role === 'mentor').length;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="card-duo p-6 md:p-8 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-duo-red flex items-center justify-center border-2 border-red-200">
            <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-duo-red px-2 py-0.5 rounded-md bg-red-100 border border-red-300">
                Administrator Command
              </span>
              <span className="text-xs font-bold text-gray-400">
                System Superuser
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Admin Command Control Center
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Live moderation queue, dynamic RBAC user controls, and academic module configurations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/notes"
            className="btn-tactile btn-tactile-orange px-4 py-2.5 text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Review Queue ({pendingNotes.length})</span>
          </Link>
          <Link
            href="/admin/users"
            className="btn-tactile btn-tactile-blue px-4 py-2.5 text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-duo-blue" />
          </div>
          <div className="text-3xl font-black text-gray-900">{profiles.length}</div>
          <span className="text-[11px] font-bold text-gray-500 mt-1 block">
            {studentCount} Students &bull; {mentorCount} Mentors
          </span>
        </div>

        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Pending Notes</span>
            <Clock className="w-4 h-4 text-duo-orange" />
          </div>
          <div className="text-3xl font-black text-duo-orange">{pendingNotes.length}</div>
          <span className="text-[11px] font-bold text-gray-500 mt-1 block">
            Awaiting curation approval
          </span>
        </div>

        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Approved Library</span>
            <CheckCircle className="w-4 h-4 text-duo-green" />
          </div>
          <div className="text-3xl font-black text-duo-green">{approvedNotes.length}</div>
          <span className="text-[11px] font-bold text-gray-500 mt-1 block">
            Live across student feeds
          </span>
        </div>

        <div className="card-duo p-5 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Academic Modules</span>
            <BookOpen className="w-4 h-4 text-duo-purple" />
          </div>
          <div className="text-3xl font-black text-gray-900">{subjects.length}</div>
          <span className="text-[11px] font-bold text-gray-500 mt-1 block">
            Global curriculum subjects
          </span>
        </div>
      </div>

      {/* Split Section: Moderation Preview & Subject Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moderation Preview Link Panel */}
        <div className="card-duo p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-duo-orange" />
                <h2 className="text-lg font-black text-gray-900">Content Moderation Queue</h2>
              </div>
              <Link href="/admin/notes" className="text-xs font-bold text-duo-orange hover:underline">
                Open Split-Pane Curator &rarr;
              </Link>
            </div>

            {pendingNotes.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs font-bold text-gray-500">✨ Zero pending notes! The moderation queue is clear.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingNotes.slice(0, 4).map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl border-2 border-[#E5E5E5] bg-[#F9FAFB] flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase text-duo-orange">
                        {note.subject_name || 'Academic'}
                      </span>
                      <h4 className="font-bold text-xs text-gray-900 mt-0.5 line-clamp-1">{note.title}</h4>
                      <span className="text-[11px] text-gray-400">By {note.uploader_name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          StudySyncStore.approveNote(note.id);
                          showToast(`Approved "${note.title}"!`);
                          loadData();
                        }}
                        className="btn-tactile btn-tactile-green px-3 py-1 text-xs font-bold rounded-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          StudySyncStore.rejectNote(note.id, 'Does not adhere to curriculum standards.');
                          showToast(`Rejected "${note.title}".`);
                          loadData();
                        }}
                        className="btn-tactile btn-tactile-red px-3 py-1 text-xs font-bold rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">
              Review full descriptions and file attachments in dedicated viewer.
            </span>
            <Link
              href="/admin/notes"
              className="btn-tactile btn-tactile-outline px-3.5 py-1.5 text-xs font-bold rounded-lg"
            >
              Full Split-Pane
            </Link>
          </div>
        </div>

        {/* Dynamic Academic Subject Configurator */}
        <div id="subjects" className="card-duo p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-duo-green" />
            <h2 className="text-lg font-black text-gray-900">Academic Subject Configurator</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium mb-4">
            Create new global academic categories dynamically. Added subjects become instantly selectable across all student and mentor portals.
          </p>

          <form onSubmit={handleCreateSubject} className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase text-gray-600 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence &amp; Robotics"
                value={newSubName}
                onChange={(e) => {
                  setNewSubName(e.target.value);
                  if (!newSubSlug) {
                    setNewSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-gray-600 mb-1">
                  Unique Slug *
                </label>
                <input
                  type="text"
                  placeholder="ai-robotics"
                  value={newSubSlug}
                  onChange={(e) => setNewSubSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-600 mb-1">
                  Brand Color
                </label>
                <select
                  value={newSubColor}
                  onChange={(e) => setNewSubColor(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-black text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
                >
                  <option value="#58CC02">Primary Green (#58CC02)</option>
                  <option value="#1CB0F6">Sky Blue (#1CB0F6)</option>
                  <option value="#FF9600">Soft Orange (#FF9600)</option>
                  <option value="#CE82FF">Vibrant Purple (#CE82FF)</option>
                  <option value="#78D933">Accent Mint (#78D933)</option>
                  <option value="#FFC800">Warm Yellow (#FFC800)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-600 mb-1">
                Description &amp; Syllabus Coverage *
              </label>
              <textarea
                rows={2}
                placeholder="Brief outline of topics included under this academic discipline..."
                value={newSubDesc}
                onChange={(e) => setNewSubDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-green focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn-tactile btn-tactile-green py-2.5 text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deploy Subject to Curriculums</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
