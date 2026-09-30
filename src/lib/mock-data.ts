import { Profile, Subject, Note, Question, Answer, Bookmark, Notification, SessionRequest } from '@/types';

// Strict User Rule: ZERO pre-baked users or engagement items.
// All users and actions originate dynamically via the registration and workspace portals.
export const INITIAL_PROFILES: Profile[] = [];

export const INITIAL_NOTES: Note[] = [];

export const INITIAL_QUESTIONS: Question[] = [];

export const INITIAL_ANSWERS: Answer[] = [];

export const INITIAL_BOOKMARKS: Bookmark[] = [];

export const INITIAL_SESSIONS: SessionRequest[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

// Standard default academic modules ONLY
export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-cs',
    name: 'Computer Science',
    slug: 'computer-science',
    description: 'Data Structures, Operating Systems, Algorithms, Networks & Software Architecture',
    icon: 'Binary',
    color: '#58CC02',
    notes_count: 0,
    questions_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-math',
    name: 'Mathematics',
    slug: 'mathematics',
    description: 'Linear Algebra, Multivariable Calculus, Discrete Math & Probability',
    icon: 'Calculator',
    color: '#1CB0F6',
    notes_count: 0,
    questions_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-phy',
    name: 'Physics',
    slug: 'physics',
    description: 'Classical Mechanics, Electromagnetism, Optics & Quantum Physics',
    icon: 'Atom',
    color: '#FF9600',
    notes_count: 0,
    questions_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-chem',
    name: 'Chemistry',
    slug: 'chemistry',
    description: 'Organic Chemistry, Chemical Kinetics, Thermodynamics & Material Science',
    icon: 'FlaskConical',
    color: '#CE82FF',
    notes_count: 0,
    questions_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-bio',
    name: 'Biology',
    slug: 'biology',
    description: 'Molecular Genetics, Cellular Biology, Ecology & Physiology',
    icon: 'Dna',
    color: '#78D933',
    notes_count: 0,
    questions_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-lit',
    name: 'Literature',
    slug: 'literature',
    description: 'Rhetorical Analysis, Critical Theory, Narrative Structure & World Classics',
    icon: 'BookOpen',
    color: '#FFC800',
    notes_count: 0,
    questions_count: 0,
    created_at: new Date().toISOString(),
  },
];
