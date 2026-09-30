'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  HelpCircle,
  Calendar,
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  MessageSquare,
  Search,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { CircularProgress } from '@/components/CircularProgress';
import { AskQuestionModal } from '@/components/AskQuestionModal';
import { Profile, Subject, Bookmark, Question, SessionRequest } from '@/types';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [mySessions, setMySessions] = useState<SessionRequest[]>([]);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const user = StudySyncStore.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=/dashboard/student');
      return;
    }
    if (user.role !== 'student' && user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    setCurrentUser(user);
    setSubjects(StudySyncStore.getSubjects());
    setBookmarks(StudySyncStore.getBookmarks(user.id));
    setMyQuestions(StudySyncStore.getQuestions().filter((q) => q.student_id === user.id));
    setMySessions(StudySyncStore.getSessions(user.id, 'student'));
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    window.addEventListener('studysync_storage_update', loadData);
    return () => window.removeEventListener('studysync_storage_update', loadData);
  }, [router]);

  if (!mounted || !currentUser) return null;

  return (
    <div className="space-y-8">
      {/* Student Profile Summary & Welcome Banner */}
      <div className="card-duo p-6 md:p-8 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name}
            className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-[#E5E5E5] object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-duo-green px-2 py-0.5 rounded-md bg-green-50 border border-green-200">
                Student Learner
              </span>
              <span className="text-xs font-bold text-gray-400">
                @{currentUser.username}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Welcome back, {currentUser.full_name}!
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Keep your learning streak active today by reviewing notes or asking doubts.
            </p>
          </div>
        </div>

        {/* Tactile Metric Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-[#FFF9F2] border-2 border-[#FFE2C2] text-center">
            <div className="flex items-center gap-1.5 text-duo-orange font-black text-sm">
              <Flame className="w-4 h-4 fill-duo-orange" />
              <span>{currentUser.streak_count} Days</span>
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400">Study Streak</span>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-[#F0F8FF] border-2 border-[#C2E0FF] text-center">
            <div className="flex items-center gap-1.5 text-duo-blue font-black text-sm">
              <Sparkles className="w-4 h-4 fill-duo-blue" />
              <span>{currentUser.reputation} pts</span>
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400">Reputation</span>
          </div>
        </div>
      </div>

      {/* 4 Circular Visual Meters */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">Academic Engagement Meters</h2>
          <span className="text-xs font-bold text-gray-400">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CircularProgress
            value={subjects.length}
            max={10}
            label="Active Subjects"
            sublabel={`${subjects.length} modules available`}
            icon={<BookOpen className="w-4 h-4 stroke-[2.5]" />}
            color="#58CC02"
          />
          <CircularProgress
            value={StudySyncStore.getApprovedNotes().length}
            max={20}
            label="Verified Notes"
            sublabel="Ready to download"
            icon={<BookOpen className="w-4 h-4 stroke-[2.5]" />}
            color="#1CB0F6"
          />
          <CircularProgress
            value={bookmarks.length}
            max={15}
            label="Saved Bookmarks"
            sublabel="In personal binder"
            icon={<BookmarkIcon className="w-4 h-4 stroke-[2.5]" />}
            color="#CE82FF"
          />
          <CircularProgress
            value={myQuestions.length}
            max={10}
            label="Doubts Solved"
            sublabel={`${myQuestions.filter((q) => q.answers_count > 0).length} with answers`}
            icon={<HelpCircle className="w-4 h-4 stroke-[2.5]" />}
            color="#FF9600"
          />
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setIsAskModalOpen(true)}
          className="p-5 rounded-2xl bg-white border-2 border-[#E5E5E5] hover:border-duo-green transition-all text-left flex items-start justify-between group active:translate-y-[1px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-duo-green/10 text-duo-green flex items-center justify-center mb-3 border border-duo-green/20">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-sm text-gray-900 group-hover:text-duo-green">
              Ask a Doubt
            </h3>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Submit peer question with validated modal
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-duo-green group-hover:translate-x-1 transition-all mt-1" />
        </button>

        <Link
          href="/notes/browse"
          className="p-5 rounded-2xl bg-white border-2 border-[#E5E5E5] hover:border-duo-blue transition-all text-left flex items-start justify-between group active:translate-y-[1px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-duo-blue/10 text-duo-blue flex items-center justify-center mb-3 border border-duo-blue/20">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-sm text-gray-900 group-hover:text-duo-blue">
              Browse Notes
            </h3>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Explore cheat sheets &amp; summaries
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-duo-blue group-hover:translate-x-1 transition-all mt-1" />
        </Link>

        <Link
          href="/bookmarks"
          className="p-5 rounded-2xl bg-white border-2 border-[#E5E5E5] hover:border-duo-purple transition-all text-left flex items-start justify-between group active:translate-y-[1px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-duo-purple/10 text-duo-purple flex items-center justify-center mb-3 border border-duo-purple/20">
              <BookmarkIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-sm text-gray-900 group-hover:text-duo-purple">
              My Bookmarks
            </h3>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              {bookmarks.length} saved resources
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-duo-purple group-hover:translate-x-1 transition-all mt-1" />
        </Link>

        <Link
          href="/mentors/profiles"
          className="p-5 rounded-2xl bg-white border-2 border-[#E5E5E5] hover:border-duo-orange transition-all text-left flex items-start justify-between group active:translate-y-[1px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-duo-orange/10 text-duo-orange flex items-center justify-center mb-3 border border-duo-orange/20">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-sm text-gray-900 group-hover:text-duo-orange">
              Book a Mentor
            </h3>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Request 1-on-1 study sync
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-duo-orange group-hover:translate-x-1 transition-all mt-1" />
        </Link>
      </div>

      {/* Split Section: My 1-on-1 Sessions & My Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1-on-1 Sessions Panel */}
        <div className="card-duo p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-duo-orange" />
                <h3 className="font-black text-base text-gray-900">My 1-on-1 Learning Sessions</h3>
              </div>
              <Link
                href="/mentors/profiles"
                className="text-xs font-bold text-duo-orange hover:underline"
              >
                + Find Mentor
              </Link>
            </div>

            {mySessions.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-500 font-medium">
                  No active 1-on-1 session requests yet.
                </p>
                <Link
                  href="/mentors/profiles"
                  className="mt-3 inline-block btn-tactile btn-tactile-orange px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Schedule with a Mentor
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {mySessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-xl border-2 border-[#E5E5E5] bg-[#F9FAFB] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-gray-900">
                          {session.mentor_name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-200 text-gray-700">
                          {session.subject_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(session.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>

                    <div>
                      {session.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Accepted
                        </span>
                      )}
                      {session.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                        </span>
                      )}
                      {session.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3.5 h-3.5 text-red-600" /> Declined
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Questions & Activity */}
        <div className="card-duo p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-duo-green" />
                <h3 className="font-black text-base text-gray-900">My Community Doubts</h3>
              </div>
              <button
                onClick={() => setIsAskModalOpen(true)}
                className="text-xs font-bold text-duo-green hover:underline"
              >
                + Ask Doubt
              </button>
            </div>

            {myQuestions.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-500 font-medium">
                  You haven&apos;t posted any doubts yet.
                </p>
                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="mt-3 btn-tactile btn-tactile-green px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Post Your First Doubt
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myQuestions.slice(0, 4).map((q) => (
                  <Link
                    key={q.id}
                    href={`/qa/${q.id}`}
                    className="p-3.5 rounded-xl border-2 border-[#E5E5E5] bg-[#F9FAFB] hover:border-gray-400 block transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-duo-green">
                        {q.subject_name || 'Academic'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(q.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-duo-green transition-colors mt-1 line-clamp-1">
                      {q.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-bold">
                      <span>💬 {q.answers_count} Answers</span>
                      <span className="text-duo-green group-hover:underline">View solutions &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
