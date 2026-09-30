"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  HelpCircle,
  Plus,
  CheckCircle,
  Clock,
  Eye,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { StudySyncStore } from "@/lib/store";
import { Question, Subject } from "@/types";
import { AskQuestionModal } from "@/components/AskQuestionModal";

export default function QALoungePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unanswered" | "solved"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadQuestions = () => {
    setQuestions(StudySyncStore.getQuestions());
    setSubjects(StudySyncStore.getSubjects());
  };

  useEffect(() => {
    setMounted(true);
    loadQuestions();

    window.addEventListener("studysync_storage_update", loadQuestions);
    return () =>
      window.removeEventListener("studysync_storage_update", loadQuestions);
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject =
      selectedSubject === "all" || q.subject_id === selectedSubject;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unanswered" && q.answers_count === 0) ||
      (statusFilter === "solved" && q.is_solved);
    return matchesSubject && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(id) => {
          loadQuestions();
        }}
      />

      {/* Floating 3D Green Action Button (Mobile & Desktop) */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-3d btn-3d-green px-6 py-4 rounded-3xl font-black text-sm uppercase flex items-center gap-2.5 shadow-2xl tracking-wider"
          title="Ask a Question"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="card-duo p-6 md:p-8 bg-gradient-to-r from-white via-white to-orange-50 border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-duo-orange/10 text-duo-orange-dark font-black text-xs uppercase tracking-wider">
            <span>Section 4 &bull; Peer Knowledge Exchange</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800">
            Adaptive <span className="text-duo-orange">Q&amp;A Lounge</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm max-w-xl">
            Stuck on a lemma, scheduler race condition, or circuit equation? Ask
            your peers or answer questions to earn gems and climb the league
            table!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-3d btn-3d-green px-6 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Question (+20 XP)</span>
        </button>
      </div>

      {/* Category Filter Headers Layout */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter by Academic Category</span>
        </div>

        {/* Category Pills Header */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSubject("all")}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase transition-all whitespace-nowrap ${
              selectedSubject === "all"
                ? "bg-duo-dark text-white shadow-duo"
                : "bg-white text-gray-600 border-2 border-[#E5E5E5] hover:bg-gray-50"
            }`}
          >
            All Subjects ({questions.length})
          </button>

          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            const count = questions.filter(
              (q) => q.subject_id === sub.id,
            ).length;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase transition-all whitespace-nowrap border-2 flex items-center gap-2 ${
                  isSelected
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-[#E5E5E5] hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor: isSelected ? sub.color : undefined,
                  boxShadow: isSelected
                    ? `0 4px 0 0 rgba(0,0,0,0.2)`
                    : undefined,
                }}
              >
                <span>{sub.code}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Status Filters */}
        <div className="flex items-center gap-2 pt-1 text-xs font-bold text-gray-500">
          <span>Status:</span>
          {(["all", "unanswered", "solved"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl uppercase text-[11px] font-black transition-colors ${
                statusFilter === st
                  ? "bg-duo-orange text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Question Cards Feed */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="card-duo p-12 text-center bg-white space-y-4">
            <span className="text-6xl block">💬🦉</span>
            <h3 className="text-2xl font-black text-gray-800">
              No questions found in this category
            </h3>
            <p className="text-gray-500 font-bold text-sm max-w-md mx-auto">
              Be the first student to start a discussion in this subject area!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-3d btn-3d-green px-6 py-3 rounded-2xl font-black text-xs uppercase inline-block"
            >
              Ask the First Question
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isUnanswered = q.answers_count === 0;

            return (
              <div
                key={q.id}
                className="card-duo p-5 md:p-6 bg-white hover:border-duo-orange transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-duo-orange/10 text-duo-orange">
                      {q.subject_name}
                    </span>

                    {q.is_solved ? (
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-duo-green/10 text-duo-green flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Solved
                      </span>
                    ) : isUnanswered ? (
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-duo-red/10 text-duo-red flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Unanswered (+50 XP)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-400">
                        Active Discussion
                      </span>
                    )}
                  </div>

                  <Link href={`/qa/${q.id}`}>
                    <h3 className="text-lg font-black text-gray-800 group-hover:text-duo-orange transition-colors leading-snug">
                      {q.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-500 font-medium line-clamp-2">
                    {q.description}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-xs font-bold text-gray-400 flex-wrap">
                    <span className="text-gray-700">
                      Asked by {q.student_name || q.author_name}
                    </span>
                    <span>&bull;</span>
                    <span>
                      {new Date(q.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {q.views_count ?? 14} views
                    </span>
                    <div className="flex items-center gap-1 pl-2">
                      {(q.tags || ["Academics"]).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action & Counters */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-black">
                    <MessageSquare className="w-4 h-4 text-duo-orange" />
                    <span>{q.answers_count} Answers</span>
                  </div>

                  <Link
                    href={`/qa/${q.id}`}
                    className={`btn-3d px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-1 ${
                      isUnanswered ? "btn-3d-orange" : "btn-3d-outline"
                    }`}
                  >
                    <span>{isUnanswered ? "Answer Now" : "View Thread"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
