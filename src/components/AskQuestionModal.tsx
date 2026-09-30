'use client';

import React, { useState } from 'react';
import { X, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { StudySyncStore } from '@/lib/store';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (questionId: string) => void;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const subjects = StudySyncStore.getSubjects();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'sub-cs');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = 'Question title is required.';
    } else if (title.trim().length < 8) {
      errs.title = 'Title must be at least 8 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Question context is required.';
    } else if (description.trim().length < 15) {
      errs.description = 'Please provide sufficient context (minimum 15 characters).';
    }

    if (!subjectId) {
      errs.subjectId = 'Please select a subject category.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newQuestion = StudySyncStore.createQuestion({
      title: title.trim(),
      description: description.trim(),
      subject_id: subjectId,
    });

    onSuccess(newQuestion.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="card-duo w-full max-w-2xl bg-white p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-duo-green text-white flex items-center justify-center border-b-2 border-duo-green-dark">
            <HelpCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              Ask the Community
            </h2>
            <p className="text-xs font-bold text-gray-400">
              Get peer explanations from verified students and course mentors.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
              Academic Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E5E5] font-bold text-gray-800 bg-[#F9FAFB] focus:outline-none focus:border-duo-green text-xs"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
              Question Title *
            </label>
            <input
              type="text"
              placeholder="e.g. How does virtual memory paging prevent external fragmentation?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-bold text-gray-800 bg-[#F9FAFB] text-xs focus:outline-none ${
                errors.title
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-[#E5E5E5] focus:border-duo-green'
              }`}
            />
            {errors.title && (
              <span className="text-[11px] font-bold text-red-500 mt-1 block">
                {errors.title}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
              Detailed Explanation / Code / Formulas *
            </label>
            <textarea
              rows={4}
              placeholder="Include textbook problem statement, attempted steps, or code snippet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-medium text-gray-800 bg-[#F9FAFB] text-xs focus:outline-none ${
                errors.description
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-[#E5E5E5] focus:border-duo-green'
              }`}
            />
            {errors.description && (
              <span className="text-[11px] font-bold text-red-500 mt-1 block">
                {errors.description}
              </span>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile btn-tactile-outline px-4 py-2 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile btn-tactile-green px-5 py-2 text-xs font-bold rounded-xl"
            >
              Post Doubt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
