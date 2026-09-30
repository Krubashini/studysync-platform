'use client';

import React, { useState } from 'react';
import { X, FileUp, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { StudySyncStore } from '@/lib/store';

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadNoteModal: React.FC<UploadNoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const subjects = StudySyncStore.getSubjects();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'sub-cs');
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = 'Note title is required.';
    } else if (title.trim().length < 6) {
      errs.title = 'Title must be at least 6 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.trim().length < 10) {
      errs.description = 'Please provide a descriptive summary (minimum 10 characters).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    StudySyncStore.createNote({
      title: title.trim(),
      subject_id: subjectId,
      file_name: fileName.trim() || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      file_size: `${(Math.random() * 2 + 1.2).toFixed(1)} MB`,
      description: description.trim(),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="card-duo w-full max-w-xl bg-white p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-duo-blue text-white flex items-center justify-center border-b-2 border-duo-blue-dark">
            <FileUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              Contribute Study Notes
            </h2>
            <p className="text-xs font-bold text-gray-400">
              Uploaded notes enter the admin review queue and reward reputation points upon approval.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
              Target Academic Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E5E5] font-bold text-gray-800 bg-[#F9FAFB] focus:outline-none focus:border-duo-blue text-xs"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
              Note Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Complete Dynamic Programming Cheatsheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-bold text-gray-800 bg-[#F9FAFB] text-xs focus:outline-none ${
                errors.title
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-[#E5E5E5] focus:border-duo-blue'
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
              File Attachment Name (PDF)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="dp_algorithms_cheatsheet.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#E5E5E5] font-bold text-gray-800 bg-[#F9FAFB] text-xs focus:outline-none focus:border-duo-blue"
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block font-medium">
              Accepts PDF, EPUB, or Markdown attachments.
            </span>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
              Description & Syllabus Outline *
            </label>
            <textarea
              rows={4}
              placeholder="Outline what topics this note covers, key formulas, or target exam questions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-medium text-gray-800 bg-[#F9FAFB] text-xs focus:outline-none ${
                errors.description
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-[#E5E5E5] focus:border-duo-blue'
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
              className="btn-tactile btn-tactile-blue px-5 py-2 text-xs font-bold rounded-xl"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
