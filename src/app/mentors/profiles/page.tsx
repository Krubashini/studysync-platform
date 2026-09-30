'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Sparkles,
  Calendar,
  Star,
  Award,
  BookOpen,
  CheckCircle,
  X,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Profile, Subject } from '@/types';

export default function MentorProfilesPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Booking Modal State
  const [bookingMentor, setBookingMentor] = useState<Profile | null>(null);
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const loadData = () => {
    setCurrentUser(StudySyncStore.getCurrentUser());
    setMentors(StudySyncStore.getMentors());
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

  const handleOpenBooking = (mentor: Profile) => {
    if (!currentUser) {
      showToast('⚠️ Please register or sign in as a student to book a mentor session.');
      return;
    }
    setBookingMentor(mentor);
    setBookingSubject(subjects[0]?.name || 'Computer Science');
    setBookingDate(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bookingMentor) return;

    StudySyncStore.createSessionRequest({
      student_id: currentUser.id,
      student_name: currentUser.full_name,
      mentor_id: bookingMentor.id,
      mentor_name: bookingMentor.full_name,
      subject_name: bookingSubject,
      scheduled_at: bookingDate,
      notes: bookingNotes,
    });

    showToast(`🌸 1-on-1 session request sent to ${bookingMentor.full_name}!`);
    setBookingMentor(null);
    setBookingNotes('');
  };

  if (!mounted) return null;

  // Filter mentors
  const filteredMentors = mentors.filter((m) => {
    const matchesQuery =
      searchQuery === '' ||
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.expertise && m.expertise.some((exp) => exp.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesSubject =
      selectedSubject === 'all' ||
      (m.expertise && m.expertise.includes(selectedSubject));

    return matchesQuery && matchesSubject;
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
          <span className="text-xs font-black uppercase text-duo-orange tracking-wider">
            Verified Academic Mentors
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Connect with Peer Mentors
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Book focused 1-on-1 learning sessions, review verified credentials, and accelerate your mastery.
          </p>
        </div>

        {!currentUser && (
          <Link
            href="/register?role=mentor"
            className="btn-tactile btn-tactile-orange px-4 py-2.5 text-xs font-bold rounded-xl self-start md:self-center"
          >
            Become a Mentor
          </Link>
        )}
      </div>

      {/* Search & Subject Filter */}
      <div className="card-duo p-4 bg-white flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mentors by name or academic expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-orange focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all whitespace-nowrap ${
              selectedSubject === 'all'
                ? 'bg-duo-orange text-white border-duo-orange-dark'
                : 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-300'
            }`}
          >
            All Fields
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all whitespace-nowrap ${
                selectedSubject === sub.name
                  ? 'bg-duo-orange text-white border-duo-orange-dark'
                  : 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-300'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <div className="card-duo p-12 text-center bg-white">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-duo-orange flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-base text-gray-800">No mentors registered yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {mentors.length === 0
              ? 'New mentors can register dynamically by selecting "Mentor" on the registration form.'
              : 'No mentors matched your current filter criteria.'}
          </p>
          <Link
            href="/register?role=mentor"
            className="mt-4 inline-block btn-tactile btn-tactile-orange px-4 py-2 text-xs font-bold rounded-xl"
          >
            Register as a Mentor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="card-duo p-5 bg-white flex flex-col justify-between hover:border-gray-400 transition-all group"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={mentor.avatar_url}
                    alt={mentor.full_name}
                    className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-[#E5E5E5] object-cover"
                  />
                  <div>
                    <h3 className="font-black text-base text-gray-900 group-hover:text-duo-orange transition-colors">
                      {mentor.full_name}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold">@{mentor.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Mentor
                      </span>
                      <span className="text-xs font-extrabold text-duo-orange flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-duo-orange" />
                        {mentor.reputation} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-gray-500">Expertise:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(mentor.expertise || ['General Academics']).map((exp) => (
                      <span
                        key={exp}
                        className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400">
                  🔥 {mentor.streak_count}d Active Streak
                </span>
                <button
                  onClick={() => handleOpenBooking(mentor)}
                  className="btn-tactile btn-tactile-orange px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Request Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Session Modal */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setBookingMentor(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <img
                src={bookingMentor.avatar_url}
                alt={bookingMentor.full_name}
                className="w-12 h-12 rounded-xl border-2 border-[#E5E5E5] object-cover"
              />
              <div>
                <span className="text-[10px] font-black uppercase text-duo-orange">
                  Request 1-on-1 Session
                </span>
                <h3 className="text-lg font-black text-gray-900">{bookingMentor.full_name}</h3>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
                  Academic Subject
                </label>
                <select
                  value={bookingSubject}
                  onChange={(e) => setBookingSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-orange focus:outline-none"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
                  Proposed Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
                  Topic & Notes for Mentor
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the concepts or problem sets you'd like guidance with..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-[#F9FAFB] border-2 border-[#E5E5E5] rounded-xl focus:border-duo-orange focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingMentor(null)}
                  className="btn-tactile btn-tactile-outline px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-tactile btn-tactile-orange px-5 py-2 text-xs font-bold rounded-xl"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
