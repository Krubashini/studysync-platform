'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  CheckCircle,
  ThumbsUp,
  Share2,
  Clock,
  Eye,
  Send,
  Code,
  Bold,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import { StudySyncStore } from '@/lib/store';
import { Question, Answer, Profile } from '@/types';
import { triggerConfetti } from '@/components/Confetti';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadThread = () => {
    const q = StudySyncStore.getQuestionById(questionId);
    setQuestion(q || null);
    const ans = StudySyncStore.getAnswersForQuestion(questionId);
    setAnswers(ans);
    setCurrentUser(StudySyncStore.getCurrentUser());
  };

  useEffect(() => {
    setMounted(true);
    loadThread();

    window.addEventListener('studysync_storage_update', loadThread);
    return () => window.removeEventListener('studysync_storage_update', loadThread);
  }, [questionId]);

  const handlePostAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerContent.trim() || !question) return;

    setIsSubmitting(true);
    setTimeout(() => {
      StudySyncStore.postAnswer(question.id, newAnswerContent.trim());
      setNewAnswerContent('');
      setIsSubmitting(false);
      triggerConfetti();
      setToastMessage('🎉 Answer posted! You earned +30 StudySync XP!');
      setTimeout(() => setToastMessage(null), 4000);
      loadThread();
    }, 200);
  };

  const insertSnippet = (template: string) => {
    setNewAnswerContent((prev) => prev + template);
  };

  if (!mounted) return null;

  if (!question) {
    return (
      <div className="card-duo p-12 text-center bg-white space-y-4 max-w-xl mx-auto my-12">
        <span className="text-5xl block">⚠️</span>
        <h2 className="text-2xl font-black text-gray-800">
          Question Not Found
        </h2>
        <p className="text-gray-500 font-bold text-sm">
          This question may have been removed or the ID is invalid.
        </p>
        <Link
          href="/qa"
          className="btn-3d btn-3d-green px-6 py-2.5 rounded-2xl font-black text-xs uppercase inline-block"
        >
          Return to Q&amp;A Lounge
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-duo-dark text-white px-5 py-3 rounded-2xl shadow-xl border-2 border-duo-green flex items-center gap-2 font-bold text-sm animate-in slide-in-from-bottom-4">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Link */}
      <Link
        href="/qa"
        className="inline-flex items-center gap-2 text-xs font-black uppercase text-gray-400 hover:text-duo-green transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Q&amp;A Lounge</span>
      </Link>

      {/* Main Targeted Question Card */}
      <article className="card-duo p-6 md:p-8 bg-white border-[#E5E5E5] space-y-5">
        {/* Header Tags & Metadata */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-duo-orange/10 text-duo-orange">
              {question.subject_name}
            </span>
            {question.is_solved && (
              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-duo-green/10 text-duo-green flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Solved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(question.created_at).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {question.views_count ?? 16} views
            </span>
          </div>
        </div>

        {/* Question Title */}
        <h1 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
          {question.title}
        </h1>

        {/* Question Body */}
        <div className="text-gray-700 font-medium text-sm md:text-base leading-relaxed whitespace-pre-line bg-[#FAFBFD] p-5 rounded-2xl border border-gray-100">
          {question.description}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {(question.tags || ['Curriculum']).map((tag) => (
            <span
              key={tag}
              className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-xl"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Profile Badge Footer */}
        <div className="pt-4 border-t-2 border-[#F0F0F0] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-duo-orange/10 border-2 border-duo-orange/30 flex items-center justify-center font-black text-duo-orange">
              {(question.student_name || question.author_name || 'ST').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-gray-800">
                  {question.student_name || question.author_name || 'Student'}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  student
                </span>
              </div>
              <span className="text-xs font-bold text-gray-400">
                Original Author
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                setToastMessage('🔗 Thread link copied to clipboard!');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="btn-3d btn-3d-outline px-3.5 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </article>

      {/* Reactive Counter Tracking Total Answers Submitted */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-duo-orange" />
          <h2 className="text-xl font-black text-gray-800">
            {answers.length} {answers.length === 1 ? 'Community Answer' : 'Community Answers'}
          </h2>
        </div>
        <span className="text-xs font-bold text-gray-400">
          Chronological Peer Responses
        </span>
      </div>

      {/* Answer Feed */}
      <div className="space-y-4">
        {answers.length === 0 ? (
          <div className="card-duo p-8 text-center bg-white space-y-2">
            <span className="text-4xl block">💡</span>
            <h3 className="text-lg font-black text-gray-800">
              No answers yet!
            </h3>
            <p className="text-xs font-bold text-gray-400">
              Be the first verified peer or mentor to submit a solution below.
            </p>
          </div>
        ) : (
          answers.map((ans, idx) => (
            <div
              key={ans.id}
              className={`card-duo p-6 bg-white transition-all space-y-4 ${
                ans.is_accepted ? 'border-duo-green bg-[#F6FFF0]' : 'border-[#E5E5E5]'
              }`}
            >
              {/* Answer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-duo-blue/10 text-duo-blue flex items-center justify-center font-black text-xs border border-duo-blue/20">
                    {ans.author_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gray-800">
                        {ans.author_name}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ans.author_role === 'mentor'
                          ? 'bg-duo-purple/15 text-duo-purple'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {ans.author_role}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">
                      {new Date(ans.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {ans.is_accepted && (
                  <span className="px-3 py-1 rounded-full bg-duo-green text-white text-xs font-black uppercase flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accepted Answer
                  </span>
                )}
              </div>

              {/* Answer Content */}
              <div className="text-gray-800 font-medium text-sm md:text-base leading-relaxed whitespace-pre-line">
                {ans.content}
              </div>

              {/* Upvote & Endorsement Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400">
                <button
                  onClick={() => {
                    StudySyncStore.upvoteAnswer(ans.id);
                    loadThread();
                    triggerConfetti();
                    setToastMessage('👍 Upvoted peer solution!');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="btn-3d btn-3d-outline px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-gray-700 hover:text-duo-green"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({ans.upvotes || 0})</span>
                </button>

                <span className="text-[11px] text-gray-400">
                  Response #{idx + 1}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Embedded Rich Text Block to "Post an Answer" */}
      <section className="card-duo p-6 md:p-8 bg-white border-[#E5E5E5] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-duo-green" />
            <h3 className="text-xl font-black text-gray-800">
              Post Your Answer
            </h3>
          </div>
          <span className="text-xs font-black text-duo-yellow uppercase">
            +30 XP Reward
          </span>
        </div>

        {/* Toolbar Helpers */}
        <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
          <button
            type="button"
            onClick={() => insertSnippet(' **bold text** ')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 font-black text-xs flex items-center gap-1"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n```c\n// Code here\n```\n')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-xs flex items-center gap-1"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n> Quoted reference here\n')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-xs flex items-center gap-1"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>
        </div>

        <form onSubmit={handlePostAnswer} className="space-y-4">
          <textarea
            rows={5}
            value={newAnswerContent}
            onChange={(e) => setNewAnswerContent(e.target.value)}
            placeholder="Write a clear, structured peer explanation. Include mathematical formulas, code blocks, or textbook diagrams..."
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E5E5] border-b-4 font-medium text-gray-800 focus:outline-none focus:border-duo-green text-sm"
            required
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">
              Posting as <strong>{currentUser?.full_name}</strong> ({currentUser?.role})
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !newAnswerContent.trim()}
              className="btn-3d btn-3d-green px-8 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Submit Answer'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
