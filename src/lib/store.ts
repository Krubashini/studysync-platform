"use client";

import {
  Profile,
  Subject,
  Note,
  Question,
  Answer,
  Bookmark,
  Notification,
  SessionRequest,
  SearchResults,
  UserRole,
  NoteStatus,
  SessionStatus,
} from "@/types";
import {
  INITIAL_PROFILES,
  INITIAL_SUBJECTS,
  INITIAL_NOTES,
  INITIAL_QUESTIONS,
  INITIAL_ANSWERS,
  INITIAL_BOOKMARKS,
  INITIAL_SESSIONS,
  INITIAL_NOTIFICATIONS,
} from "./mock-data";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEYS = {
  CURRENT_USER_ID: "studysync_current_user_id",
  PROFILES: "studysync_profiles",
  SUBJECTS: "studysync_subjects",
  NOTES: "studysync_notes",
  QUESTIONS: "studysync_questions",
  ANSWERS: "studysync_answers",
  BOOKMARKS: "studysync_bookmarks",
  SESSIONS: "studysync_sessions",
  NOTIFICATIONS: "studysync_notifications",
};

// Safe localStorage helper
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("studysync_storage_update"));
  } catch (e) {
    console.warn(`Error writing ${key} to storage:`, e);
  }
}

export class StudySyncStore {
  // ====================================================================
  // AUTHENTICATION & LIVE ACCOUNT REGISTRATION (Zero hardcoded users)
  // ====================================================================

  static getCurrentUser(): Profile | null {
    const currentId = getStored<string | null>(
      STORAGE_KEYS.CURRENT_USER_ID,
      null,
    );
    if (!currentId) return null;
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === currentId) || null;
  }

  static async register(data: {
    email: string;
    username: string;
    full_name: string;
    role: UserRole;
    password?: string;
    expertise?: string[];
  }): Promise<{ user?: Profile; error?: string }> {
    const email = data.email.trim().toLowerCase();
    const username = data.username.trim();
    const profiles = this.getProfiles();

    // Check duplicate email or username
    if (profiles.some((p) => p.email.toLowerCase() === email)) {
      return {
        error: "An account with this email address is already registered.",
      };
    }
    if (
      profiles.some((p) => p.username.toLowerCase() === username.toLowerCase())
    ) {
      return {
        error: "This username is already taken. Please choose another.",
      };
    }

    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `usr-${Date.now()}`;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const newProfile: Profile = {
      id: newId,
      email,
      username,
      full_name: data.full_name.trim(),
      avatar_url: avatarUrl,
      role: data.role,
      streak_count: 1,
      reputation: data.role === "mentor" ? 50 : 10,
      is_disabled: false,
      expertise:
        data.expertise ||
        (data.role === "mentor"
          ? ["Computer Science", "Mathematics"]
          : undefined),
      created_at: new Date().toISOString(),
    };

    // Save to local reactive store
    const updated = [newProfile, ...profiles];
    setStored(STORAGE_KEYS.PROFILES, updated);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, newProfile.id);

    // Initial welcome notification
    this.createNotification(
      newProfile.id,
      `🌸 Welcome to StudySync, ${newProfile.full_name}! Your ${newProfile.role} workspace is ready.`,
    );

    // Supabase Live Auth sync if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signUp({
          email,
          password: data.password || "StudySync@2026",
          options: {
            data: {
              username,
              full_name: newProfile.full_name,
              role: newProfile.role,
            },
          },
        });
      } catch (err) {
        console.warn("[Supabase Auth] registration notice:", err);
      }
    }

    return { user: newProfile };
  }

  static async login(
    identifier: string,
    password?: string,
  ): Promise<{ user?: Profile; error?: string }> {
    const term = identifier.trim().toLowerCase();
    const profiles = this.getProfiles();

    // Search by email or username
    const found = profiles.find(
      (p) =>
        p.email.toLowerCase() === term || p.username.toLowerCase() === term,
    );

    if (!found) {
      return {
        error:
          "No account found matching this email/username. Please register for a free account.",
      };
    }

    if (found.is_disabled) {
      return {
        error:
          "This account has been temporarily disabled by an administrator. Please contact support.",
      };
    }

    // Set logged in
    setStored(STORAGE_KEYS.CURRENT_USER_ID, found.id);

    // Live Supabase signIn if configured
    if (isSupabaseConfigured && supabase && password) {
      try {
        await supabase.auth.signInWithPassword({
          email: found.email,
          password,
        });
      } catch (err) {
        console.warn("[Supabase Auth] sign-in notice:", err);
      }
    }

    return { user: found };
  }

  static async logout(): Promise<void> {
    setStored(STORAGE_KEYS.CURRENT_USER_ID, null);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Sign out notice:", e);
      }
    }
  }

  static switchUser(userId: string): void {
    setStored(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  // ====================================================================
  // PROFILES & USER MANAGEMENT (Admin controls)
  // ====================================================================

  static getProfiles(): Profile[] {
    return getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  static getMentors(): Profile[] {
    return this.getProfiles().filter(
      (p) => p.role === "mentor" && !p.is_disabled,
    );
  }

  static updateUserRole(userId: string, newRole: UserRole): Profile[] {
    const profiles = this.getProfiles().map((p) =>
      p.id === userId ? { ...p, role: newRole } : p,
    );
    setStored(STORAGE_KEYS.PROFILES, profiles);
    this.createNotification(
      userId,
      `🛡️ Your workspace role was updated to "${newRole}" by an administrator.`,
    );
    return profiles;
  }

  static toggleUserStatus(userId: string): Profile[] {
    const profiles = this.getProfiles().map((p) =>
      p.id === userId ? { ...p, is_disabled: !p.is_disabled } : p,
    );
    setStored(STORAGE_KEYS.PROFILES, profiles);
    return profiles;
  }

  // ====================================================================
  // SUBJECTS (Global Academic Modules)
  // ====================================================================

  static getSubjects(): Subject[] {
    return getStored<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }

  static getSubjectById(id: string): Subject | undefined {
    return this.getSubjects().find((s) => s.id === id);
  }

  static getSubjectBySlug(slug: string): Subject | undefined {
    return this.getSubjects().find((s) => s.slug === slug);
  }

  static createSubject(data: {
    name: string;
    slug: string;
    description: string;
    color?: string;
    icon?: string;
  }): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      id: `sub-${data.slug.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      description: data.description.trim(),
      color: data.color || "#58CC02",
      icon: data.icon || "BookOpen",
      notes_count: 0,
      questions_count: 0,
      created_at: new Date().toISOString(),
    };
    const updated = [...subjects, newSubject];
    setStored(STORAGE_KEYS.SUBJECTS, updated);
    return newSubject;
  }

  // ====================================================================
  // NOTES & RESOURCE FACTORY (CRUD + Moderation)
  // ====================================================================

  static getNotes(): Note[] {
    return getStored<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
  }

  static getApprovedNotes(): Note[] {
    return this.getNotes().filter((n) => n.status === "approved");
  }

  static getPendingNotes(): Note[] {
    return this.getNotes().filter((n) => n.status === "pending");
  }

  static getNotesByUploader(uploaderId: string): Note[] {
    return this.getNotes().filter((n) => n.uploader_id === uploaderId);
  }

  static createNote(data: {
    title: string;
    description: string;
    subject_id: string;
    file_url?: string;
    file_name?: string;
    file_size?: string;
    uploader_id?: string;
    uploader_name?: string;
  }): Note {
    const currentUser = this.getCurrentUser();
    const uploaderId = data.uploader_id || currentUser?.id || "anonymous";
    const uploaderName =
      data.uploader_name || currentUser?.full_name || "Artisan Scholar";
    const subjects = this.getSubjects();
    const subject = subjects.find((s) => s.id === data.subject_id);

    const newNote: Note = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `note-${Date.now()}`,
      uploader_id: uploaderId,
      uploader_name: uploaderName,
      title: data.title.trim(),
      description: data.description.trim(),
      file_url:
        data.file_url ||
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_name:
        data.file_name ||
        `${data.title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      file_size: data.file_size || "2.4 MB",
      subject_id: data.subject_id,
      subject_name: subject?.name || "General Studies",
      status: "pending", // Requires admin moderation
      average_rating: 0,
      ratings_count: 0,
      downloads_count: 0,
      created_at: new Date().toISOString(),
    };

    const notes = [newNote, ...this.getNotes()];
    setStored(STORAGE_KEYS.NOTES, notes);

    // Notify admins of new pending note
    const admins = this.getProfiles().filter((p) => p.role === "admin");
    admins.forEach((admin) => {
      this.createNotification(
        admin.id,
        `📥 New note submitted for review: "${newNote.title}" by ${uploaderName}`,
        "/admin/notes",
      );
    });

    return newNote;
  }

  static updateNoteStatus(
    noteId: string,
    status: NoteStatus,
    rejectionReason?: string,
  ): Note[] {
    let affectedNote: Note | undefined;
    const notes = this.getNotes().map((n) => {
      if (n.id === noteId) {
        affectedNote = { ...n, status, rejectionReason };
        return affectedNote;
      }
      return n;
    });
    setStored(STORAGE_KEYS.NOTES, notes);

    // Send event-based notification to uploader
    if (affectedNote) {
      if (status === "approved") {
        this.createNotification(
          affectedNote.uploader_id,
          `✅ Congratulations! Your note "${affectedNote.title}" was approved and published.`,
        );
        // Grant reputation points
        this.addReputation(affectedNote.uploader_id, 25);
      } else if (status === "rejected") {
        this.createNotification(
          affectedNote.uploader_id,
          `⚠️ Your note "${affectedNote.title}" was rejected: ${rejectionReason || "Does not meet syllabus guidelines."}`,
        );
      }
    }

    return notes;
  }

  static approveNote(noteId: string): Note[] {
    return this.updateNoteStatus(noteId, "approved");
  }

  static rejectNote(noteId: string, rejectionReason?: string): Note[] {
    return this.updateNoteStatus(noteId, "rejected", rejectionReason);
  }

  static uploadNote(data: {
    title: string;
    description: string;
    subject_id: string;
    file_url?: string;
    file_name?: string;
    file_size?: string;
    semester?: number;
  }): Note {
    return this.createNote(data);
  }

  static deleteNote(noteId: string): Note[] {
    const notes = this.getNotes().filter((n) => n.id !== noteId);
    setStored(STORAGE_KEYS.NOTES, notes);

    // Also remove from bookmarks
    const bookmarks = this.getBookmarks().filter((b) => b.note_id !== noteId);
    setStored(STORAGE_KEYS.BOOKMARKS, bookmarks);

    return notes;
  }

  static rateNote(noteId: string, rating: number): Note | undefined {
    let updatedNote: Note | undefined;
    const notes = this.getNotes().map((n) => {
      if (n.id === noteId) {
        const totalScore = n.average_rating * n.ratings_count + rating;
        const newCount = n.ratings_count + 1;
        const newAvg = Number((totalScore / newCount).toFixed(1));
        updatedNote = {
          ...n,
          average_rating: newAvg,
          ratings_count: newCount,
        };
        return updatedNote;
      }
      return n;
    });
    setStored(STORAGE_KEYS.NOTES, notes);
    return updatedNote;
  }

  static incrementDownload(noteId: string): void {
    const notes = this.getNotes().map((n) =>
      n.id === noteId ? { ...n, downloads_count: n.downloads_count + 1 } : n,
    );
    setStored(STORAGE_KEYS.NOTES, notes);
  }

  // ====================================================================
  // BOOKMARKS (Saved Study Resources)
  // ====================================================================

  static getBookmarks(userId?: string): Bookmark[] {
    const all = getStored<Bookmark[]>(
      STORAGE_KEYS.BOOKMARKS,
      INITIAL_BOOKMARKS,
    );
    const notes = this.getNotes();

    const populated = all.map((b) => ({
      ...b,
      note: notes.find((n) => n.id === b.note_id),
    }));

    if (userId) {
      return populated.filter((b) => b.user_id === userId);
    }
    return populated;
  }

  static isBookmarked(userId: string, noteId: string): boolean {
    const all = getStored<Bookmark[]>(
      STORAGE_KEYS.BOOKMARKS,
      INITIAL_BOOKMARKS,
    );
    return all.some((b) => b.user_id === userId && b.note_id === noteId);
  }

  static toggleBookmark(param1: string | Note, param2?: string): boolean {
    const all = getStored<Bookmark[]>(
      STORAGE_KEYS.BOOKMARKS,
      INITIAL_BOOKMARKS,
    );
    let userId: string;
    let noteId: string;

    if (typeof param1 === "object" && param1 !== null) {
      const user = this.getCurrentUser();
      userId = user?.id || "guest-user";
      noteId = param1.id;
    } else if (param2) {
      userId = param1;
      noteId = param2;
    } else {
      const user = this.getCurrentUser();
      userId = user?.id || "guest-user";
      noteId = param1;
    }

    const existingIndex = all.findIndex(
      (b) => b.user_id === userId && b.note_id === noteId,
    );

    if (existingIndex >= 0) {
      all.splice(existingIndex, 1);
      setStored(STORAGE_KEYS.BOOKMARKS, all);
      return false; // Removed
    } else {
      const newBookmark: Bookmark = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `bm-${Date.now()}`,
        user_id: userId,
        note_id: noteId,
        created_at: new Date().toISOString(),
      };
      setStored(STORAGE_KEYS.BOOKMARKS, [newBookmark, ...all]);
      return true; // Added
    }
  }

  static removeBookmark(userId: string, noteId: string): void {
    const all = getStored<Bookmark[]>(
      STORAGE_KEYS.BOOKMARKS,
      INITIAL_BOOKMARKS,
    );
    const filtered = all.filter(
      (b) => !(b.user_id === userId && b.note_id === noteId),
    );
    setStored(STORAGE_KEYS.BOOKMARKS, filtered);
  }

  // ====================================================================
  // QUESTIONS & ANSWERS (Q&A Doubt Solver)
  // ====================================================================

  static getQuestions(): Question[] {
    return getStored<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  }

  static getQuestionById(id: string): Question | undefined {
    return this.getQuestions().find((q) => q.id === id);
  }

  static createQuestion(data: {
    title: string;
    description: string;
    subject_id: string;
    student_id?: string;
    student_name?: string;
  }): Question {
    const currentUser = this.getCurrentUser();
    const studentId = data.student_id || currentUser?.id || "anonymous";
    const studentName =
      data.student_name || currentUser?.full_name || "Curious Student";
    const subjects = this.getSubjects();
    const subject = subjects.find((s) => s.id === data.subject_id);

    const newQ: Question = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `q-${Date.now()}`,
      student_id: studentId,
      student_name: studentName,
      student_avatar: currentUser?.avatar_url,
      title: data.title.trim(),
      description: data.description.trim(),
      subject_id: data.subject_id,
      subject_name: subject?.name || "General Academic",
      answers_count: 0,
      is_solved: false,
      created_at: new Date().toISOString(),
    };

    const questions = [newQ, ...this.getQuestions()];
    setStored(STORAGE_KEYS.QUESTIONS, questions);

    // Notify mentors of this subject
    const mentors = this.getMentors();
    mentors.forEach((m) => {
      this.createNotification(
        m.id,
        `❓ New student doubt in ${newQ.subject_name}: "${newQ.title}"`,
        `/qa/${newQ.id}`,
      );
    });

    return newQ;
  }

  static getAnswers(questionId?: string): Answer[] {
    const all = getStored<Answer[]>(STORAGE_KEYS.ANSWERS, INITIAL_ANSWERS);
    if (questionId) {
      return all.filter((a) => a.question_id === questionId);
    }
    return all;
  }

  static createAnswer(data: {
    question_id: string;
    author_id?: string;
    author_name?: string;
    author_role?: UserRole;
    content: string;
  }): Answer {
    const currentUser = this.getCurrentUser();
    const authorId = data.author_id || currentUser?.id || "mentor-user";
    const authorName =
      data.author_name || currentUser?.full_name || "Verified Mentor";
    const authorRole = data.author_role || currentUser?.role || "mentor";

    const newAnswer: Answer = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `ans-${Date.now()}`,
      question_id: data.question_id,
      author_id: authorId,
      author_name: authorName,
      author_role: authorRole,
      author_avatar: currentUser?.avatar_url,
      content: data.content.trim(),
      is_accepted: false,
      created_at: new Date().toISOString(),
    };

    const answers = [...this.getAnswers(), newAnswer];
    setStored(STORAGE_KEYS.ANSWERS, answers);

    // Increment question answers count
    const questions = this.getQuestions().map((q) => {
      if (q.id === data.question_id) {
        // Send event notification to the student who asked
        StudySyncStore.createNotification(
          q.student_id,
          `💬 ${authorName} answered your question: "${q.title}"`,
          `/qa/${q.id}`,
        );
        return { ...q, answers_count: q.answers_count + 1 };
      }
      return q;
    });
    setStored(STORAGE_KEYS.QUESTIONS, questions);

    // Reward author reputation
    return newAnswer;
  }

  static getAnswersForQuestion(questionId: string): Answer[] {
    return this.getAnswers(questionId);
  }

  static postAnswer(questionId: string, content: string): Answer {
    return this.createAnswer({ question_id: questionId, content });
  }

  static acceptAnswer(answerId: string): void {
    const answers = this.getAnswers().map((a) =>
      a.id === answerId ? { ...a, is_accepted: true } : a,
    );
    setStored(STORAGE_KEYS.ANSWERS, answers);
  }

  static upvoteAnswer(answerId: string): void {
    const answers = this.getAnswers().map((a) =>
      a.id === answerId ? { ...a, upvotes: (a.upvotes || 0) + 1 } : a,
    );
    setStored(STORAGE_KEYS.ANSWERS, answers);
  }

  // ====================================================================
  // SESSIONS (1-on-1 Mentorship Booking Hub)
  // ====================================================================

  static getSessions(userId?: string, role?: UserRole): SessionRequest[] {
    const all = getStored<SessionRequest[]>(
      STORAGE_KEYS.SESSIONS,
      INITIAL_SESSIONS,
    );
    if (!userId) return all;
    if (role === "mentor") {
      return all.filter((s) => s.mentor_id === userId);
    }
    return all.filter((s) => s.student_id === userId);
  }

  static createSessionRequest(data: {
    student_id: string;
    student_name: string;
    mentor_id: string;
    mentor_name: string;
    subject_name: string;
    scheduled_at: string;
    notes?: string;
  }): SessionRequest {
    const newSession: SessionRequest = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sess-${Date.now()}`,
      student_id: data.student_id,
      student_name: data.student_name,
      mentor_id: data.mentor_id,
      mentor_name: data.mentor_name,
      subject_name: data.subject_name,
      status: "pending",
      scheduled_at: data.scheduled_at,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    const sessions = [newSession, ...this.getSessions()];
    setStored(STORAGE_KEYS.SESSIONS, sessions);

    // Event notification to mentor
    this.createNotification(
      data.mentor_id,
      `📅 New 1-on-1 Session request from ${data.student_name} for ${data.subject_name}!`,
      "/dashboard/mentor#sessions",
    );

    return newSession;
  }

  static updateSessionStatus(
    sessionId: string,
    status: SessionStatus,
  ): SessionRequest[] {
    let affected: SessionRequest | undefined;
    const sessions = this.getSessions().map((s) => {
      if (s.id === sessionId) {
        affected = { ...s, status };
        return affected;
      }
      return s;
    });
    setStored(STORAGE_KEYS.SESSIONS, sessions);

    // Event notification to student
    if (affected) {
      const verb = status === "accepted" ? "accepted 🎉" : "declined ⚠️";
      this.createNotification(
        affected.student_id,
        `📅 Mentor ${affected.mentor_name} has ${verb} your session request for ${affected.subject_name}.`,
        "/dashboard/student",
      );
    }

    return sessions;
  }

  // ====================================================================
  // NOTIFICATIONS (Event-Based Notification Hub)
  // ====================================================================

  static getNotifications(userId?: string): Notification[] {
    const all = getStored<Notification[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS,
    );
    if (userId) {
      return all.filter((n) => n.user_id === userId);
    }
    return all;
  }

  static createNotification(
    userId: string,
    message: string,
    link?: string,
  ): Notification {
    const newNotif: Notification = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `notif-${Date.now()}`,
      user_id: userId,
      message,
      is_read: false,
      link,
      created_at: new Date().toISOString(),
    };

    const notifs = [newNotif, ...this.getNotifications()];
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getNotifications().map((n) =>
      n.id === id ? { ...n, is_read: true } : n,
    );
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  static markAllNotificationsRead(userId: string): void {
    const notifs = this.getNotifications().map((n) =>
      n.user_id === userId ? { ...n, is_read: true } : n,
    );
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  static clearNotifications(userId: string): void {
    const notifs = this.getNotifications().filter((n) => n.user_id !== userId);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Helper
  private static addReputation(userId: string, amount: number): void {
    const profiles = this.getProfiles().map((p) =>
      p.id === userId ? { ...p, reputation: p.reputation + amount } : p,
    );
    setStored(STORAGE_KEYS.PROFILES, profiles);
  }

  // ====================================================================
  // GLOBAL SEARCH
  // ====================================================================

  static globalSearch(query: string): SearchResults {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { notes: [], subjects: [], questions: [], mentors: [] };
    }

    const notes = this.getApprovedNotes().filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        (n.subject_name && n.subject_name.toLowerCase().includes(q)),
    );

    const subjects = this.getSubjects().filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q),
    );

    const questions = this.getQuestions().filter(
      (qt) =>
        qt.title.toLowerCase().includes(q) ||
        qt.description.toLowerCase().includes(q) ||
        (qt.subject_name && qt.subject_name.toLowerCase().includes(q)),
    );

    const mentors = this.getMentors().filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        (m.expertise && m.expertise.some((e) => e.toLowerCase().includes(q))),
    );

    return { notes, subjects, questions, mentors };
  }

  static search(query: string): SearchResults {
    return this.globalSearch(query);
  }
}
