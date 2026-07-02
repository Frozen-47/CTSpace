export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  office: string;
  title: string;
  specialization: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
}

export interface ClassInstance {
  id: string;
  courseId: string;
  instructorId: string;
  room: string;
  scheduleDays: string[]; // e.g., ['Monday', 'Wednesday']
  scheduleTime: string; // e.g., '10:00 AM - 11:30 AM'
  capacity: number;
  term: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  grade: string; // e.g., 'A', 'B', 'B+', 'IP' (In Progress)
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c-1',
    code: 'CS-101',
    name: 'Introduction to Computer Science',
    description: 'An introduction to computation, problem-solving, and programming using Python. Topics include variables, control structures, functions, and basic data structures.',
    credits: 4,
  },
  {
    id: 'c-2',
    code: 'CS-201',
    name: 'Data Structures and Algorithms',
    description: 'Fundamental data structures including lists, stacks, queues, trees, and graphs. Analysis of algorithms, sorting, searching, and complexity theory.',
    credits: 4,
  },
  {
    id: 'c-3',
    code: 'CS-302',
    name: 'Database Systems',
    description: 'Relational database design, SQL queries, transaction management, indexing, schema refinement, and physical database design.',
    credits: 3,
  },
  {
    id: 'c-4',
    code: 'CS-355',
    name: 'Software Engineering',
    description: 'Principles, methods, and tools for designing, implementing, testing, and maintaining large-scale software systems in teams.',
    credits: 4,
  },
  {
    id: 'c-5',
    code: 'CS-401',
    name: 'Artificial Intelligence',
    description: 'Foundations of AI: state-space search, heuristic algorithms, logic representation, planning, neural networks, and introductory machine learning.',
    credits: 3,
  },
  {
    id: 'c-6',
    code: 'CS-485',
    name: 'Computer Networks',
    description: 'Concepts and architecture of computer communication networks, focusing on the TCP/IP protocol suite, routing algorithms, and socket programming.',
    credits: 3,
  }
];

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'i-1',
    name: 'Dr. Evelyn Wright',
    email: 'e.wright@university.edu',
    office: 'Tech Hall 402',
    title: 'Professor & Department Chair',
    specialization: 'Artificial Intelligence & Computer Vision',
  },
  {
    id: 'i-2',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@university.edu',
    office: 'Tech Hall 411',
    title: 'Associate Professor',
    specialization: 'Database Systems & Big Data Systems',
  },
  {
    id: 'i-3',
    name: 'Prof. Clara Hayes',
    email: 'c.hayes@university.edu',
    office: 'Tech Hall 305',
    title: 'Assistant Professor',
    specialization: 'Algorithms & Theoretical Computer Science',
  },
  {
    id: 'i-4',
    name: 'Dr. Sarah Patel',
    email: 's.patel@university.edu',
    office: 'Tech Hall 314',
    title: 'Lecturer',
    specialization: 'Software Engineering & Human-Computer Interaction',
  }
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's-1', name: 'Alice Smith', email: 'a.smith@student.edu', major: 'Computer Science', year: 'Senior' },
  { id: 's-2', name: 'Bob Johnson', email: 'b.johnson@student.edu', major: 'Computer Science', year: 'Junior' },
  { id: 's-3', name: 'Charlie Davis', email: 'c.davis@student.edu', major: 'Computer Engineering', year: 'Sophomore' },
  { id: 's-4', name: 'Diana Prince', email: 'd.prince@student.edu', major: 'Computer Science', year: 'Senior' },
  { id: 's-5', name: 'Ethan Hunt', email: 'e.hunt@student.edu', major: 'Software Engineering', year: 'Freshman' },
  { id: 's-6', name: 'Fiona Gallagher', email: 'f.gallagher@student.edu', major: 'Computer Science', year: 'Sophomore' },
  { id: 's-7', name: 'George Harrison', email: 'g.harrison@student.edu', major: 'Data Science', year: 'Junior' },
  { id: 's-8', name: 'Hannah Abbott', email: 'h.abbott@student.edu', major: 'Computer Science', year: 'Freshman' }
];

export const INITIAL_CLASSES: ClassInstance[] = [
  {
    id: 'cls-1',
    courseId: 'c-1',
    instructorId: 'i-4',
    room: 'Tech Hall 101',
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '09:00 AM - 10:30 AM',
    capacity: 40,
    term: 'Fall 2026'
  },
  {
    id: 'cls-2',
    courseId: 'c-2',
    instructorId: 'i-3',
    room: 'Tech Hall 204',
    scheduleDays: ['Tuesday', 'Thursday'],
    scheduleTime: '11:00 AM - 12:30 PM',
    capacity: 35,
    term: 'Fall 2026'
  },
  {
    id: 'cls-3',
    courseId: 'c-3',
    instructorId: 'i-2',
    room: 'Tech Hall 301',
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '01:00 PM - 02:30 PM',
    capacity: 30,
    term: 'Fall 2026'
  },
  {
    id: 'cls-4',
    courseId: 'c-4',
    instructorId: 'i-4',
    room: 'Tech Hall 102',
    scheduleDays: ['Tuesday', 'Thursday'],
    scheduleTime: '09:00 AM - 10:30 AM',
    capacity: 25,
    term: 'Fall 2026'
  },
  {
    id: 'cls-5',
    courseId: 'c-5',
    instructorId: 'i-1',
    room: 'Tech Hall 401',
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '10:00 AM - 11:30 AM',
    capacity: 25,
    term: 'Fall 2026'
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  { id: 'e-1', studentId: 's-1', classId: 'cls-5', grade: 'IP' },
  { id: 'e-2', studentId: 's-1', classId: 'cls-3', grade: 'A' },
  { id: 'e-3', studentId: 's-2', classId: 'cls-2', grade: 'B+' },
  { id: 'e-4', studentId: 's-2', classId: 'cls-3', grade: 'IP' },
  { id: 'e-5', studentId: 's-3', classId: 'cls-1', grade: 'A-' },
  { id: 'e-6', studentId: 's-3', classId: 'cls-2', grade: 'IP' },
  { id: 'e-7', studentId: 's-4', classId: 'cls-5', grade: 'IP' },
  { id: 'e-8', studentId: 's-5', classId: 'cls-1', grade: 'IP' },
  { id: 'e-9', studentId: 's-6', classId: 'cls-1', grade: 'B' },
  { id: 'e-10', studentId: 's-6', classId: 'cls-2', grade: 'IP' },
  { id: 'e-11', studentId: 's-7', classId: 'cls-3', grade: 'IP' },
  { id: 'e-12', studentId: 's-8', classId: 'cls-1', grade: 'IP' }
];
