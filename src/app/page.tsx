'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle,
  Shield,
  Star,
  Download,
  Calendar,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Profile, Subject, Note } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [featuredNotes, setFeaturedNotes] = useState<Note[]>([]);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = StudySyncStore.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      // If user is already logged in, redirect directly to their dashboard
      router.push(`/dashboard/${user.role}`);
      return;
    }

    setSubjects(StudySyncStore.getSubjects());
    setFeaturedNotes(StudySyncStore.getApprovedNotes().slice(0, 3));
    setMentors(StudySyncStore.getMentors().slice(0, 3));
  }, [router]);

  if (!mounted || currentUser) return null;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-duo-green/10 border border-duo-green/30 text-duo-green text-xs font-black mb-6 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Handcrafted Collaborative Learning
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Learn, Share, and Excel Together with{' '}
          <span className="text-duo-green underline decoration-duo-green/30 decoration-wavy">
            StudySync
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
          A peer-to-peer academic platform where students exchange verified course notes, resolve doubts in real-time, and book 1-on-1 sessions with verified mentors.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="btn-tactile btn-tactile-green px-6 py-3.5 text-base font-black rounded-xl shadow-sm flex items-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
          <Link
            href="/notes/browse"
            className="btn-tactile btn-tactile-outline px-6 py-3.5 text-base font-black rounded-xl"
          >
            Browse Study Notes
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-duo-green" /> 100% Free Peer Access
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-duo-green" /> Verified Mentor Guidance
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-duo-green" /> Zero Fluff or Bloat
          </span>
        </div>
      </section>

      {/* Academic Modules Grid */}
      <section className="bg-white border-y-2 border-[#E5E5E5] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black uppercase text-duo-green tracking-wider">
                Core Curriculums
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                Explore Academic Subjects
              </h2>
            </div>
            <Link
              href="/notes/browse"
              className="text-xs font-extrabold text-duo-green hover:underline flex items-center gap-1"
            >
              View Full Catalog &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/notes/browse?subject=${sub.id}`}
                className="group p-6 rounded-2xl bg-[#FCFCFC] border-2 border-[#E5E5E5] hover:border-gray-400 hover:bg-white transition-all active:translate-y-[1px]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white border-b-2"
                    style={{ backgroundColor: sub.color, borderColor: sub.color }}
                  >
                    <BookOpen className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                    {sub.slug}
                  </span>
                </div>
                <h3 className="font-black text-lg text-gray-900 group-hover:text-duo-green transition-colors">
                  {sub.name}
                </h3>
                <p className="mt-2 text-xs text-gray-500 font-medium leading-relaxed">
                  {sub.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Breakdown Panels */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase text-duo-blue tracking-wider">
            Three Pillars
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-1">
            Built by Learners, for Learners
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-2">
            No convoluted algorithms. Just clean, reliable educational tools tailored for authentic human collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Notes */}
          <div className="card-duo p-7 bg-white">
            <div className="w-12 h-12 rounded-xl bg-duo-blue/15 text-duo-blue flex items-center justify-center mb-5 border-2 border-duo-blue/30">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Curated Notes Library</h3>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Every note is reviewed by administrators before publication. Read summaries, download PDFs, and rate materials on a 5-star scale.
            </p>
            <Link
              href="/notes/browse"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-duo-blue mt-4 hover:underline"
            >
              Browse notes &rarr;
            </Link>
          </div>

          {/* Card 2: Q&A */}
          <div className="card-duo p-7 bg-white">
            <div className="w-12 h-12 rounded-xl bg-duo-orange/15 text-duo-orange flex items-center justify-center mb-5 border-2 border-duo-orange/30">
              <MessageSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Instant Doubt Solver</h3>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Post questions on tricky engineering problems or academic modules. Receive step-by-step verified solutions from peers and mentors.
            </p>
            <Link
              href="/qa"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-duo-orange mt-4 hover:underline"
            >
              Visit Q&A Lounge &rarr;
            </Link>
          </div>

          {/* Card 3: Mentorship */}
          <div className="card-duo p-7 bg-white">
            <div className="w-12 h-12 rounded-xl bg-duo-green/15 text-duo-green flex items-center justify-center mb-5 border-2 border-duo-green/30">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">1-on-1 Mentorship</h3>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Browse mentor profile cards with proven expertise and reputations. Schedule private study sync sessions with immediate booking confirmation.
            </p>
            <Link
              href="/mentors/profiles"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-duo-green mt-4 hover:underline"
            >
              Meet mentors &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Callout Banner */}
      <section className="bg-duo-green py-14 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-green-200">
            Join the StudySync Community
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 text-white">
            Ready to upgrade your academic journey?
          </h2>
          <p className="mt-3 text-sm font-medium text-green-100 max-w-xl mx-auto">
            Sign up in seconds. Choose whether to learn as a student or inspire as a mentor.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/register"
              className="btn-tactile bg-white text-duo-green border-2 border-green-700 px-6 py-3 text-sm font-black rounded-xl hover:bg-green-50 shadow-sm"
            >
              Create Your Account
            </Link>
            <Link
              href="/login"
              className="btn-tactile bg-duo-green-dark text-white border-2 border-green-800 px-6 py-3 text-sm font-black rounded-xl hover:bg-green-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
