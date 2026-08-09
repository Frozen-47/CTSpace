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

export const CLASS_GROUPS = [
  '3rd CT (2024-2027)',
  '2nd CT (2025-2027)',
  '2nd BBA (2025-2027)'
] as const;

export type ClassGroupType = typeof CLASS_GROUPS[number];

export interface Student {
  id: string;
  sNo?: number;
  rollNo?: string;
  name: string;
  email: string;
  classGroup: ClassGroupType;
  mark10?: string;
  mark11?: string;
  mark12?: string;
  group?: string;
  medium?: string;
  bloodGroup?: string;
  dob?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  projectDrive?: string;
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
  classGroup: ClassGroupType;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  grade: string; // e.g., 'A', 'B', 'IP' (In Progress)
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
  { id: 's-1', sNo: 1, rollNo: '22CT24038', name: 'Akash V', email: 'akasha09960@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '59%', mark11: '64%', mark12: '72%', group: 'maths, computer science', medium: 'English', bloodGroup: 'B+VE', dob: '12.11.2007', phone: '9629346096', linkedin: 'https://www.linkedin.com/in/akash-v-8131a0321', github: 'https://github.com/AkashV-V' },
  { id: 's-2', sNo: 2, rollNo: '22CT24007', name: 'Bharathi nesan M', email: 'nesan262936@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '58%', mark11: '78%', mark12: '87%', group: 'arts', medium: 'English', bloodGroup: 'O+VE', dob: '23.09.2006', phone: '6374453817', linkedin: 'https://www.linkedin.com/in/bharathi-nesan-aa0049317', github: 'https://github.com/bharathi925' },
  { id: 's-3', sNo: 3, rollNo: '22CT24010', name: 'Buvanesh M', email: 'buvanesh2309@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '50%', mark11: '60%', mark12: '57%', group: 'maths, computer science', medium: 'English', bloodGroup: 'B+VE', dob: '23.09.2006', phone: '9080570836', linkedin: 'https://www.linkedin.com/in/buvanesh-b-253588315', github: 'https://github.com/BUVANESH2006' },
  { id: 's-4', sNo: 4, rollNo: '22CT24008', name: 'Boomes N', email: 'boomesnallasivam06@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '77%', mark11: '60%', mark12: '63%', group: 'maths, computer science', medium: 'English', bloodGroup: 'O+VE', dob: '27.08.2006', phone: '8524044264', linkedin: 'https://www.linkedin.com/in/boomes-nallasivam-911282317', github: 'https://github.com/Boomesh006' },
  { id: 's-5', sNo: 5, rollNo: '22CT24025', name: 'Charuhasini J', email: 'charuhasinijothikumar@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '49%', mark11: '55%', mark12: '58%', group: 'arts', medium: 'English', bloodGroup: 'B+VE', dob: '01.12.2006', phone: '9363641697', linkedin: '', github: 'https://github.com/charuhasini07' },
  { id: 's-6', sNo: 6, rollNo: '22CT24021', name: 'Devan R', email: 'devandevan80162@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '59%', mark11: '55%', mark12: '61%', group: 'maths, biology', medium: 'English', bloodGroup: 'O+VE', dob: '13.11.2004', phone: '9342893168', linkedin: 'https://www.linkedin.com/in/devan-r-9b257a304', github: 'https://github.com/Devan3405' },
  { id: 's-7', sNo: 7, rollNo: '22CT24028', name: 'Dharmar S', email: 'gukan2711@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '40%', mark11: '53%', mark12: '48%', group: 'Biology,Computer science', medium: 'Tamil', bloodGroup: 'B+VE', dob: '27.11.2006', phone: '8098667074', linkedin: 'https://www.linkedin.com/in/gukan-gugan-9b3282317', github: 'https://github.com/Gukan-89' },
  { id: 's-8', sNo: 8, rollNo: '22CT24024', name: 'Gowtham R', email: 'gowthamram1211@outlook.com', classGroup: '3rd CT (2024-2027)', mark10: '59%', mark11: '68%', mark12: '75%', group: 'Arts,history,acc,eco,commerce', medium: 'Tamil', bloodGroup: 'O+VE', dob: '28.02.2007', phone: '6379323168', linkedin: 'https://www.linkedin.com/in/s-gowtham-476047317', github: 'https://github.com/gowtham508' },
  { id: 's-9', sNo: 9, rollNo: '22CT24034', name: 'Gowtham S', email: 'gowtham.s.63793231@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '53%', mark11: '67%', mark12: '73%', group: 'arts', medium: 'Tamil', bloodGroup: 'A+VE', dob: '28.02.2007', phone: '9043328254', linkedin: 'https://www.linkedin.com/in/gowtham-ram-036b2131a', github: 'https://github.com/Gowtham12112006' },
  { id: 's-10', sNo: 10, rollNo: '22CT24004', name: 'Hari S', email: 'harism0220@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '76%', mark11: '59%', mark12: '69%', group: 'maths, computer science', medium: 'English', bloodGroup: 'B+VE', dob: '02.10.2006', phone: '9865471935', linkedin: 'https://www.linkedin.com/in/hari-s-224283317', github: 'https://github.com/Hari02-S' },
  { id: 's-11', sNo: 11, rollNo: '22CT24016', name: 'Iswarya M E', email: 'iswaryaemmanuvel@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '78%', mark11: '73%', mark12: '75%', group: '-', medium: 'English', bloodGroup: 'O+VE', dob: '22.09.2006', phone: '6369595651', linkedin: 'https://www.linkedin.com/in/iswarya-emmanuvel-171288317', github: 'https://github.com/iswarya229' },
  { id: 's-12', sNo: 12, rollNo: '22CT24022', name: 'Janani R', email: 'janani.dreams4@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '70%', mark11: '68%', mark12: '75%', group: 'Computer application', medium: 'English', bloodGroup: 'B+VE', dob: '25.11.2006', phone: '9123593448', linkedin: 'https://www.linkedin.com/in/janani-raja-232288317', github: 'https://github.com/JANANI-CO' },
  { id: 's-13', sNo: 13, rollNo: '22CT24027', name: 'Joyal V', email: 'Joyalv1008@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '63%', mark11: '56%', mark12: '57%', group: 'Computer application', medium: 'English', bloodGroup: 'B+VE', dob: '10.05.2007', phone: '8778497072', linkedin: 'https://www.linkedin.com/in/joyal-v-83248231a', github: 'https://github.com/Joyal1008' },
  { id: 's-14', sNo: 14, rollNo: '22CT24031', name: 'Karpagavalli P', email: 'pkarpagavalli2006@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '86%', mark11: '92%', mark12: '96%', group: 'Computer application', medium: 'English', bloodGroup: 'O+VE', dob: '26.09.2006', phone: '8189950226', linkedin: 'https://in.linkedin.com/in/karpagavalli-a46282317', github: 'https://github.com/karpagavalli26' },
  { id: 's-15', sNo: 15, rollNo: '22CT24029', name: 'Karthik K', email: 'karthik16062007k@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '82%', mark11: '74%', mark12: '76%', group: 'Biology,computer science', medium: 'English', bloodGroup: 'B+VE', dob: '16.06.2007', phone: '7695982755', linkedin: 'https://www.linkedin.com/in/karthik-k-b64838316', github: 'https://github.com/Karthik2007k' },
  { id: 's-16', sNo: 16, rollNo: '22CT24001', name: 'Kavin E S', email: 'imkavin74@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '86%', mark11: '77%', mark12: '78%', group: 'maths, computer science', medium: 'English', bloodGroup: 'O+VE', dob: '16.06.2007', phone: '9566389394', linkedin: 'https://www.linkedin.com/in/ghost-55045b28b', github: 'https://github.com/Ghost-74' },
  { id: 's-17', sNo: 17, rollNo: '22CT24005', name: 'Maithees P', email: 'maithees215@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '64%', mark11: '64%', mark12: '68%', group: 'maths, computer science', medium: 'English', bloodGroup: 'A+VE', dob: '12.11.2006', phone: '6381285152', linkedin: 'https://www.linkedin.com/in/maithees-maithees-30b179315', github: 'https://github.com/MAITHEES' },
  { id: 's-18', sNo: 18, rollNo: '22CT24015', name: 'Nehaa M R', email: 'nehaamr970@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '90%', mark11: 'NA', mark12: '54%', group: 'Biology,Computer science', medium: 'English', bloodGroup: 'B+VE', dob: '27.06.2007', phone: '9345521970', linkedin: 'https://www.linkedin.com/in/nehaa-murugesan-92b644315', github: 'https://github.com/nehaa45521970' },
  { id: 's-19', sNo: 19, rollNo: '22CT24006', name: 'Prakash M', email: 'prakashm112006@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '69%', mark11: '58%', mark12: '66%', group: 'maths, biology', medium: 'English', bloodGroup: 'O+VE', dob: '16.11.2006', phone: '9787612557', linkedin: 'https://www.linkedin.com/in/m-prakash-b7317a315/', github: 'https://github.com/prakash-bscct' },
  { id: 's-20', sNo: 20, rollNo: '22CT24014', name: 'Prasanna V', email: 'madaraxuchihax14@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '72%', mark11: '58%', mark12: '70%', group: 'maths, computer science', medium: 'English', bloodGroup: 'B-VE', dob: '22.08.2006', phone: '9344167326', linkedin: 'https://www.linkedin.com/in/v-prasanna-982049317/', github: 'https://github.com/Prasannax14' },
  { id: 's-21', sNo: 21, rollNo: '22CT24012', name: 'Priscilla P', email: 'priscilla.mailbox0105@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '46%', mark11: '57%', mark12: '62%', group: 'arts', medium: 'English', bloodGroup: 'B+VE', dob: '01.05.2006', phone: '8610386752', linkedin: 'https://linkedIn.com/in/priscilla-priscilla-a54282317/', github: 'https://github.com/Priscilla0105' },
  { id: 's-22', sNo: 22, rollNo: '22CT24023', name: 'Priya G', email: 'ppriyagovindasamy@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '73%', mark11: '71%', mark12: '83%', group: 'arts', medium: 'English', bloodGroup: 'O+VE', dob: '10.04.2007', phone: '6383682929', linkedin: 'https://www.linkedin.com/in/priyagovindasamy', github: 'https://github.com/priya1004720' },
  { id: 's-23', sNo: 23, rollNo: '22CT24013', name: 'Rebekkha Thavamani M', email: 'rebekkhathavamani@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '65%', mark11: '77%', mark12: '85%', group: 'arts', medium: 'English', bloodGroup: 'A+VE', dob: '25.01.2007', phone: '9345003531', linkedin: 'https://www.linkedin.com/in/rebekkha-thavamani-bb2715316/', github: 'https://github.com/rebekkhathavamani' },
  { id: 's-24', sNo: 24, rollNo: '22CT24026', name: 'Rubasree K', email: 'rubasreek09@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '52%', mark11: '48%', mark12: '49%', group: 'maths, computer science', medium: 'English', bloodGroup: 'O+VE', dob: '04.04.2007', phone: '8056795821', linkedin: 'https://www.linkedin.com/in/rubasree-k-612593317', github: 'https://github.com/Rubasree858' },
  { id: 's-25', sNo: 25, rollNo: '22CT24002', name: 'Sabareesh G', email: 'sabareeshgm47@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '62%', mark11: '70%', mark12: '77%', group: 'maths, computer science', medium: 'English', bloodGroup: 'O+VE', dob: '07.07.2007', phone: '7845840747', linkedin: 'https://www.linkedin.com/in/sabareesh-ganeshmoorthi-5aa180315', github: 'https://github.com/Frozen-47' },
  { id: 's-26', sNo: 26, rollNo: '22CT24019', name: 'Sanjaikumar R', email: 'sanjaikumar62297@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '57%', mark11: '51%', mark12: '74%', group: 'arts', medium: 'English', bloodGroup: 'O+VE', dob: '16.06.2007', phone: '8903394628', linkedin: 'https://www.linkedin.com/in/sanjai-kumar-94b7714316', github: 'https://github.com/sanjaikumar16062007' },
  { id: 's-27', sNo: 27, rollNo: '22CT24032', name: 'Sarmini A', email: 'sarmisarmi8430@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '67%', mark11: '75%', mark12: '78%', group: 'Computer application', medium: 'English', bloodGroup: 'B+VE', dob: '23.07.2006', phone: '9342843715', linkedin: 'https://linkedin.com/in/sarmi-sarmi-492048317', github: 'https://github.com/sharmini2006' },
  { id: 's-28', sNo: 28, rollNo: '22CT24039', name: 'Sheeba A', email: 'sheebaa512@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '79%', mark11: 'NA', mark12: '71%', group: 'Math , computer science, biology', medium: 'English', bloodGroup: 'B+VE', dob: '14.04.2007', phone: '8270907159', linkedin: 'https://www.linkedin.com/in/a-sheeba-88a97b287/', github: 'https://github.com/Sheebaa12' },
  { id: 's-29', sNo: 29, rollNo: '22CT24009', name: 'Sivakumar D', email: 'sivaerd293@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '69%', mark11: '62%', mark12: '69%', group: 'arts', medium: 'English', bloodGroup: 'O+VE', dob: '04.03.2006', phone: '7200883700', linkedin: 'https://www.linkedin.com/in/siva-kumar-323065317', github: 'https://github.com/sivakumar-2006' },
  { id: 's-30', sNo: 30, rollNo: '22CT24030', name: 'Siva Pratheepa T', email: 'pratheepasiva2007@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '79%', mark11: '84%', mark12: '90%', group: 'arts', medium: 'English', bloodGroup: 'B+VE', dob: '12.04.2007', phone: '9150718535', linkedin: 'https://www.linkedin.com/in/siva-pratheepa-014284317', github: 'https://github.com/sivapratheepa' },
  { id: 's-31', sNo: 31, rollNo: '22CT24035', name: 'Sneha G A', email: 'gasneha2024@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '71%', mark11: '77%', mark12: '81%', group: 'Business maths, accountancy', medium: 'English', bloodGroup: 'O+VE', dob: '01.12.2006', phone: '9500697080', linkedin: 'https://www.linkedin.com/in/sneha-g-a-511b03319', github: 'https://github.com/SNEHA178' },
  { id: 's-32', sNo: 32, rollNo: '22CT24003', name: 'Srivathsan V', email: 'srivathsandharun@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '61%', mark11: '51%', mark12: '56%', group: 'arts', medium: 'English', bloodGroup: 'A+VE', dob: '12.05.2007', phone: '9894371065', linkedin: 'https://www.linkedin.com/in/srivathsan-dharun-954043317', github: 'https://github.com/srivathsan600' },
  { id: 's-33', sNo: 33, rollNo: '22CT24033', name: 'Vinith D', email: 'Vinithd5727@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '58%', mark11: '43%', mark12: '51%', group: '-', medium: 'TAMIL', bloodGroup: 'A+VE', dob: '05.09.2007', phone: '6369435727', linkedin: 'https://www.linkedin.com/in/vini-9b300318', github: 'https://github.com/Vinith-D05' },
  { id: 's-34', sNo: 34, rollNo: '22CT24020', name: 'Yogalakshmi R', email: 'yogu47640@gmail.com', classGroup: '3rd CT (2024-2027)', mark10: '82%', mark11: '81%', mark12: '87%', group: 'Biology, computer science', medium: 'English', bloodGroup: 'A1B+VE', dob: '12.02.2007', phone: '6374880326', linkedin: 'https://www.linkedin.com/in/yogalakshmi-rajamanickam-057366317', github: 'https://github.com/Yoga1203' }
];

export const INITIAL_CLASSES: ClassInstance[] = [
  {
    id: 'cls-1',
    courseId: 'c-1',
    instructorId: 'i-4',
    room: 'Tech Room 101',
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '09:00 AM - 10:30 AM',
    capacity: 40,
    term: 'Fall 2026',
    classGroup: '2nd BBA (2025-2027)'
  },
  {
    id: 'cls-2',
    courseId: 'c-2',
    instructorId: 'i-3',
    room: 'Tech Room 204',
    scheduleDays: ['Tuesday', 'Thursday'],
    scheduleTime: '11:00 AM - 12:30 PM',
    capacity: 35,
    term: 'Fall 2026',
    classGroup: '2nd CT (2025-2027)'
  },
  {
    id: 'cls-3',
    courseId: 'c-3',
    instructorId: 'i-2',
    room: 'Tech Room 301',
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '01:00 PM - 02:30 PM',
    capacity: 30,
    term: 'Fall 2026',
    classGroup: '3rd CT (2024-2027)'
  },
  {
    id: 'cls-4',
    courseId: 'c-4',
    instructorId: 'i-4',
    room: 'Tech Room 102',
    scheduleDays: ['Tuesday', 'Thursday'],
    scheduleTime: '09:00 AM - 10:30 AM',
    capacity: 25,
    term: 'Fall 2026',
    classGroup: '3rd CT (2024-2027)'
  },
  {
    id: 'cls-5',
    courseId: 'c-5',
    instructorId: 'i-1',
    room: 'Tech Room 401',
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '10:00 AM - 11:30 AM',
    capacity: 25,
    term: 'Fall 2026',
    classGroup: '3rd CT (2024-2027)'
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
