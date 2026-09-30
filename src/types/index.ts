export type UserRole = 'student' | 'mentor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  streak_count: number;
  reputation: number; // Experience / Reputation points
  is_disabled: boolean;
  expertise?: string[]; // For mentors
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  notes_count?: number;
  questions_count?: number;
  created_at?: string;
}

export type NoteStatus = 'pending' | 'approved' | 'rejected';

export interface Note {
  id: string;
  uploader_id: string;
  uploader_name: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: string;
  subject_id: string;
  subject_name?: string;
  status: NoteStatus;
  average_rating: number;
  ratings_count: number;
  downloads_count: number;
  rejection_reason?: string;
  created_at: string;
}

export interface Question {
  id: string;
  student_id: string;
  student_name: string;
  author_name?: string; // alias
  student_avatar?: string;
  title: string;
  description: string;
  subject_id: string;
  subject_name?: string;
  answers_count: number;
  views_count?: number;
  tags?: string[];
  is_solved?: boolean;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  content: string;
  is_accepted: boolean;
  upvotes?: number;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  note_id: string;
  note?: Note;
  created_at: string;
}

export type SessionStatus = 'pending' | 'accepted' | 'rejected';

export interface SessionRequest {
  id: string;
  student_id: string;
  student_name: string;
  mentor_id: string;
  mentor_name: string;
  subject_name: string;
  status: SessionStatus;
  scheduled_at: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface SearchResults {
  notes: Note[];
  subjects: Subject[];
  questions: Question[];
  mentors: Profile[];
}
