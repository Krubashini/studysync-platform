-- ====================================================================
-- StudySync Platform Database Architecture & Security Schema
-- Target: Supabase (PostgreSQL with Row Level Security)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked dynamically with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
    streak_count INT NOT NULL DEFAULT 1,
    reputation INT NOT NULL DEFAULT 0,
    is_disabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'BookOpen',
    color TEXT NOT NULL DEFAULT '#58CC02',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    uploader_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL DEFAULT 'document.pdf',
    file_size TEXT NOT NULL DEFAULT '1.8 MB',
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    ratings_count INT NOT NULL DEFAULT 0,
    downloads_count INT NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Questions Table (Student Q&A Doubts)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    answers_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'mentor' CHECK (author_role IN ('student', 'mentor', 'admin')),
    content TEXT NOT NULL,
    is_accepted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, note_id)
);

-- 8. Sessions Table (1-on-1 Mentor Mentorship Requests)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view active public profiles; users can insert and update their own
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subjects: Publicly readable; only admins can modify
CREATE POLICY "Subjects are viewable by all" 
ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Only admins can manage subjects" 
ON public.subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notes: Approved notes visible to all; uploader and admin can see all
CREATE POLICY "Approved notes are viewable by everyone" 
ON public.notes FOR SELECT USING (
    status = 'approved' OR 
    uploader_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can create notes" 
ON public.notes FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Uploaders and admins can update notes" 
ON public.notes FOR UPDATE USING (
    uploader_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Uploaders and admins can delete notes" 
ON public.notes FOR DELETE USING (
    uploader_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Questions: Public read; authenticated create
CREATE POLICY "Questions are viewable by all" 
ON public.questions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" 
ON public.questions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Answers: Public read; authenticated create
CREATE POLICY "Answers are viewable by all" 
ON public.answers FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post answers" 
ON public.answers FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Bookmarks: Strictly isolated per user
CREATE POLICY "Users can only view their own bookmarks" 
ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only create their own bookmarks" 
ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own bookmarks" 
ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Sessions: Viewable by student or mentor
CREATE POLICY "Participants can view their sessions" 
ON public.sessions FOR SELECT USING (auth.uid() = student_id OR auth.uid() = mentor_id);

CREATE POLICY "Students can request sessions" 
ON public.sessions FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Mentors can update session status" 
ON public.sessions FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Notifications: Strictly isolated per user
CREATE POLICY "Users can only view their own notifications" 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications" 
ON public.notifications FOR INSERT WITH CHECK (true);

-- ====================================================================
-- AUTOMATIC PROFILE TRIGGER ON SUPABASE AUTH REGISTRATION
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, full_name, role, avatar_url, streak_count, reputation)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'student'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id),
        1,
        0
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- SEED DATA: Standard Academic Modules ONLY (NO FAKE USERS)
-- ====================================================================

INSERT INTO public.subjects (id, name, slug, description, icon, color) VALUES
('sub-cs', 'Computer Science', 'computer-science', 'Data Structures, Operating Systems, Algorithms & Architecture', 'Binary', '#58CC02'),
('sub-math', 'Mathematics', 'mathematics', 'Linear Algebra, Multivariable Calculus, Probability & Statistics', 'Calculator', '#1CB0F6'),
('sub-phy', 'Physics', 'physics', 'Classical Mechanics, Electromagnetism, Quantum Mechanics & Optics', 'Atom', '#FF9600'),
('sub-chem', 'Chemistry', 'chemistry', 'Organic Synthesis, Thermodynamics, Molecular Dynamics & Spectroscopy', 'FlaskConical', '#CE82FF'),
('sub-bio', 'Biology', 'biology', 'Cellular Biology, Genetics, Bioinformatics & Physiology', 'Dna', '#78D933'),
('sub-lit', 'Literature', 'literature', 'Rhetorical Analysis, Comparative Literature, Semiotics & Poetry', 'BookOpen', '#FFC800')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description;
