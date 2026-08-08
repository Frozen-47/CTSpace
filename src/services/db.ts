import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase';
import {
  type Course, type Instructor, type Student, type ClassInstance, type Enrollment,
  INITIAL_COURSES, INITIAL_INSTRUCTORS, INITIAL_STUDENTS, INITIAL_CLASSES, INITIAL_ENROLLMENTS
} from '../mock/mockData';

// Initialize Supabase client if URL and Anon Key are provided
let supabase: any = null;
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  try {
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

// Dynamic helper to check if Supabase should be used
const useSupabase = () => SUPABASE_CONFIG.getUseSupabase() && supabase !== null;

// Local Storage helpers for mock mode
const getLocal = <T>(key: string, seed: T[]): T[] => {
  const data = localStorage.getItem(`ctspace_${key}`);
  if (data === null) {
    localStorage.setItem(`ctspace_${key}`, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch {
    return seed;
  }
};

const setLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(`ctspace_${key}`, JSON.stringify(data));
};

// --- Time & Conflict Helpers ---

export function parseTime(timeStr: string): number {
  const parts = timeStr.trim().split(/\s+/);
  if (parts.length !== 2) return 0;
  const [hoursStr, minutesStr] = parts[0].split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const ampm = parts[1].toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function timesOverlap(timeRangeA: string, timeRangeB: string): boolean {
  const partsA = timeRangeA.split(/\s*-\s*/);
  const partsB = timeRangeB.split(/\s*-\s*/);
  if (partsA.length !== 2 || partsB.length !== 2) return false;

  const startA = parseTime(partsA[0]);
  const endA = parseTime(partsA[1]);
  const startB = parseTime(partsB[0]);
  const endB = parseTime(partsB[1]);

  return startA < endB && endA > startB;
}

export function checkSchedulingConflict(
  classId: string | null,
  instructorId: string,
  room: string,
  days: string[],
  time: string,
  term: string,
  classGroup: string,
  existingClasses: ClassInstance[]
): { conflict: boolean; type?: 'instructor' | 'room' | 'classGroup'; message?: string } {
  for (const cls of existingClasses) {
    // Ignore self if editing
    if (classId && cls.id === classId) continue;
    
    // Check if the term and schedule days overlap
    if (cls.term === term && days.some(d => cls.scheduleDays.includes(d))) {
      if (timesOverlap(cls.scheduleTime, time)) {
        // Instructor conflict
        if (cls.instructorId === instructorId) {
          return {
            conflict: true,
            type: 'instructor',
            message: `Instructor is already scheduled for another class during this timeslot (${cls.scheduleTime} on ${cls.scheduleDays.join('/')}).`
          };
        }
        // Room conflict
        if (cls.room.toLowerCase() === room.toLowerCase()) {
          return {
            conflict: true,
            type: 'room',
            message: `Room "${cls.room}" is already booked for another class during this timeslot.`
          };
        }
        // Class group conflict
        if (cls.classGroup === classGroup) {
          return {
            conflict: true,
            type: 'classGroup',
            message: `Class group "${classGroup}" is already scheduled for another class during this timeslot.`
          };
        }
      }
    }
  }
  return { conflict: false };
}

// --- Column Mappers for Supabase (snake_case <-> camelCase) ---

const mapStudentFromDb = (row: any): Student => ({
  id: row.id,
  name: row.name,
  email: row.email,
  classGroup: row.class_group || row.classGroup
});

const mapStudentToDb = (s: Partial<Student>) => {
  const payload: any = { ...s };
  if (payload.classGroup !== undefined) {
    payload.class_group = payload.classGroup;
    delete payload.classGroup;
  }
  return payload;
};

const mapClassFromDb = (row: any): ClassInstance => ({
  id: row.id,
  courseId: row.course_id || row.courseId,
  instructorId: row.instructor_id || row.instructorId,
  room: row.room,
  scheduleDays: row.schedule_days || row.scheduleDays || [],
  scheduleTime: row.schedule_time || row.scheduleTime,
  capacity: row.capacity,
  term: row.term,
  classGroup: row.class_group || row.classGroup
});

const mapClassToDb = (cls: Partial<ClassInstance>) => {
  const payload: any = { ...cls };
  if (payload.courseId !== undefined) { payload.course_id = payload.courseId; delete payload.courseId; }
  if (payload.instructorId !== undefined) { payload.instructor_id = payload.instructorId; delete payload.instructorId; }
  if (payload.scheduleDays !== undefined) { payload.schedule_days = payload.scheduleDays; delete payload.scheduleDays; }
  if (payload.scheduleTime !== undefined) { payload.schedule_time = payload.scheduleTime; delete payload.scheduleTime; }
  if (payload.classGroup !== undefined) { payload.class_group = payload.classGroup; delete payload.classGroup; }
  return payload;
};

const mapEnrollmentFromDb = (row: any): Enrollment => ({
  id: row.id,
  studentId: row.student_id || row.studentId,
  classId: row.class_id || row.classId,
  grade: row.grade
});

const mapEnrollmentToDb = (e: Partial<Enrollment>) => {
  const payload: any = { ...e };
  if (payload.studentId !== undefined) { payload.student_id = payload.studentId; delete payload.studentId; }
  if (payload.classId !== undefined) { payload.class_id = payload.classId; delete payload.classId; }
  return payload;
};

// --- Database Operations ---

export const db = {
  // Reset database to initial seeds
  resetDatabase: async (): Promise<void> => {
    if (useSupabase()) {
      console.warn("Reset operation is only available in mock mode.");
    }
    localStorage.removeItem('ctspace_courses');
    localStorage.removeItem('ctspace_instructors');
    localStorage.removeItem('ctspace_students');
    localStorage.removeItem('ctspace_classes');
    localStorage.removeItem('ctspace_enrollments');
  },

  // Export full database state as a JSON string
  exportDatabaseJSON: async (): Promise<string> => {
    const data = {
      courses: await db.getCourses(),
      instructors: await db.getInstructors(),
      students: await db.getStudents(),
      classes: await db.getClasses(),
      enrollments: await db.getEnrollments(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  },

  // Import full database state from JSON
  importDatabaseJSON: async (jsonString: string): Promise<void> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON format.');
      }
      if (Array.isArray(parsed.courses)) setLocal('courses', parsed.courses);
      if (Array.isArray(parsed.instructors)) setLocal('instructors', parsed.instructors);
      if (Array.isArray(parsed.students)) setLocal('students', parsed.students);
      if (Array.isArray(parsed.classes)) setLocal('classes', parsed.classes);
      if (Array.isArray(parsed.enrollments)) setLocal('enrollments', parsed.enrollments);
    } catch (err: any) {
      throw new Error(`Failed to parse database backup file: ${err.message}`);
    }
  },

  // Courses CRUD
  getCourses: async (): Promise<Course[]> => {
    if (useSupabase()) {
      const { data, error } = await supabase.from('courses').select('*').order('code');
      if (error) throw error;
      return data;
    }
    return getLocal<Course>('courses', INITIAL_COURSES).sort((a, b) => a.code.localeCompare(b.code));
  },

  saveCourse: async (course: Omit<Course, 'id'> & { id?: string }): Promise<Course> => {
    if (useSupabase()) {
      if (course.id) {
        const { data, error } = await supabase.from('courses').update(course).eq('id', course.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('courses').insert(course).select().single();
        if (error) throw error;
        return data;
      }
    } else {
      const courses = getLocal<Course>('courses', INITIAL_COURSES);
      let finalCourse: Course;
      if (course.id) {
        finalCourse = course as Course;
        const index = courses.findIndex(c => c.id === course.id);
        if (index !== -1) courses[index] = finalCourse;
      } else {
        finalCourse = { ...course, id: 'c-' + Date.now() } as Course;
        courses.push(finalCourse);
      }
      setLocal('courses', courses);
      return finalCourse;
    }
  },

  deleteCourse: async (id: string): Promise<void> => {
    if (useSupabase()) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    } else {
      const courses = getLocal<Course>('courses', INITIAL_COURSES).filter(c => c.id !== id);
      setLocal('courses', courses);
      // Delete any dependent classes/enrollments
      const classes = getLocal<ClassInstance>('classes', INITIAL_CLASSES).filter(cls => cls.courseId !== id);
      setLocal('classes', classes);
    }
  },

  // Instructors CRUD
  getInstructors: async (): Promise<Instructor[]> => {
    if (useSupabase()) {
      const { data, error } = await supabase.from('instructors').select('*').order('name');
      if (error) throw error;
      return data;
    }
    return getLocal<Instructor>('instructors', INITIAL_INSTRUCTORS).sort((a, b) => a.name.localeCompare(b.name));
  },

  saveInstructor: async (instructor: Omit<Instructor, 'id'> & { id?: string }): Promise<Instructor> => {
    if (useSupabase()) {
      if (instructor.id) {
        const { data, error } = await supabase.from('instructors').update(instructor).eq('id', instructor.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('instructors').insert(instructor).select().single();
        if (error) throw error;
        return data;
      }
    } else {
      const instructors = getLocal<Instructor>('instructors', INITIAL_INSTRUCTORS);
      let finalInstructor: Instructor;
      if (instructor.id) {
        finalInstructor = instructor as Instructor;
        const index = instructors.findIndex(i => i.id === instructor.id);
        if (index !== -1) instructors[index] = finalInstructor;
      } else {
        finalInstructor = { ...instructor, id: 'i-' + Date.now() } as Instructor;
        instructors.push(finalInstructor);
      }
      setLocal('instructors', instructors);
      return finalInstructor;
    }
  },

  deleteInstructor: async (id: string): Promise<void> => {
    if (useSupabase()) {
      const { error } = await supabase.from('instructors').delete().eq('id', id);
      if (error) throw error;
    } else {
      const instructors = getLocal<Instructor>('instructors', INITIAL_INSTRUCTORS).filter(i => i.id !== id);
      setLocal('instructors', instructors);
      // Nullify or delete classes scheduled with this instructor
      const classes = getLocal<ClassInstance>('classes', INITIAL_CLASSES).filter(cls => cls.instructorId !== id);
      setLocal('classes', classes);
    }
  },

  // Students CRUD
  getStudents: async (): Promise<Student[]> => {
    if (useSupabase()) {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (error) throw error;
      return (data || []).map(mapStudentFromDb);
    }
    return getLocal<Student>('students', INITIAL_STUDENTS).sort((a, b) => a.name.localeCompare(b.name));
  },

  saveStudent: async (student: Omit<Student, 'id'> & { id?: string }): Promise<Student> => {
    if (useSupabase()) {
      const payload = mapStudentToDb(student);
      if (student.id) {
        const { data, error } = await supabase.from('students').update(payload).eq('id', student.id).select().single();
        if (error) throw error;
        return mapStudentFromDb(data);
      } else {
        const { data, error } = await supabase.from('students').insert(payload).select().single();
        if (error) throw error;
        return mapStudentFromDb(data);
      }
    } else {
      const students = getLocal<Student>('students', INITIAL_STUDENTS);
      let finalStudent: Student;
      if (student.id) {
        finalStudent = student as Student;
        const index = students.findIndex(s => s.id === student.id);
        if (index !== -1) students[index] = finalStudent;
      } else {
        finalStudent = { ...student, id: 's-' + Date.now() } as Student;
        students.push(finalStudent);
      }
      setLocal('students', students);
      return finalStudent;
    }
  },

  deleteStudent: async (id: string): Promise<void> => {
    if (useSupabase()) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    } else {
      const students = getLocal<Student>('students', INITIAL_STUDENTS).filter(s => s.id !== id);
      setLocal('students', students);
      // Delete student enrollments
      const enrollments = getLocal<Enrollment>('enrollments', INITIAL_ENROLLMENTS).filter(e => e.studentId !== id);
      setLocal('enrollments', enrollments);
    }
  },

  // Classes CRUD
  getClasses: async (): Promise<ClassInstance[]> => {
    if (useSupabase()) {
      const { data, error } = await supabase.from('classes').select('*');
      if (error) throw error;
      return (data || []).map(mapClassFromDb);
    }
    return getLocal<ClassInstance>('classes', INITIAL_CLASSES);
  },

  saveClass: async (cls: Omit<ClassInstance, 'id'> & { id?: string }): Promise<ClassInstance> => {
    // Validate conflict before saving
    const existingClasses = await db.getClasses();
    const conflictCheck = checkSchedulingConflict(
      cls.id || null,
      cls.instructorId,
      cls.room,
      cls.scheduleDays,
      cls.scheduleTime,
      cls.term,
      cls.classGroup,
      existingClasses
    );

    if (conflictCheck.conflict) {
      throw new Error(conflictCheck.message);
    }

    if (useSupabase()) {
      const payload = mapClassToDb(cls);
      if (cls.id) {
        const { data, error } = await supabase.from('classes').update(payload).eq('id', cls.id).select().single();
        if (error) throw error;
        return mapClassFromDb(data);
      } else {
        const { data, error } = await supabase.from('classes').insert(payload).select().single();
        if (error) throw error;
        return mapClassFromDb(data);
      }
    } else {
      const classes = getLocal<ClassInstance>('classes', INITIAL_CLASSES);
      let finalClass: ClassInstance;
      if (cls.id) {
        finalClass = cls as ClassInstance;
        const index = classes.findIndex(c => c.id === cls.id);
        if (index !== -1) classes[index] = finalClass;
      } else {
        finalClass = { ...cls, id: 'cls-' + Date.now() } as ClassInstance;
        classes.push(finalClass);
      }
      setLocal('classes', classes);
      return finalClass;
    }
  },

  deleteClass: async (id: string): Promise<void> => {
    if (useSupabase()) {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    } else {
      const classes = getLocal<ClassInstance>('classes', INITIAL_CLASSES).filter(c => c.id !== id);
      setLocal('classes', classes);
      // Delete enrollments for this class
      const enrollments = getLocal<Enrollment>('enrollments', INITIAL_ENROLLMENTS).filter(e => e.classId !== id);
      setLocal('enrollments', enrollments);
    }
  },

  // Enrollments CRUD
  getEnrollments: async (): Promise<Enrollment[]> => {
    if (useSupabase()) {
      const { data, error } = await supabase.from('enrollments').select('*');
      if (error) throw error;
      return (data || []).map(mapEnrollmentFromDb);
    }
    return getLocal<Enrollment>('enrollments', INITIAL_ENROLLMENTS);
  },

  saveEnrollment: async (enrollment: Omit<Enrollment, 'id'> & { id?: string }): Promise<Enrollment> => {
    if (useSupabase()) {
      const payload = mapEnrollmentToDb(enrollment);
      if (enrollment.id) {
        const { data, error } = await supabase.from('enrollments').update(payload).eq('id', enrollment.id).select().single();
        if (error) throw error;
        return mapEnrollmentFromDb(data);
      } else {
        const { data, error } = await supabase.from('enrollments').insert(payload).select().single();
        if (error) throw error;
        return mapEnrollmentFromDb(data);
      }
    } else {
      const enrollments = getLocal<Enrollment>('enrollments', INITIAL_ENROLLMENTS);
      let finalEnrollment: Enrollment;
      if (enrollment.id) {
        finalEnrollment = enrollment as Enrollment;
        const index = enrollments.findIndex(e => e.id === enrollment.id);
        if (index !== -1) enrollments[index] = finalEnrollment;
      } else {
        finalEnrollment = { ...enrollment, id: 'e-' + Date.now() } as Enrollment;
        enrollments.push(finalEnrollment);
      }
      setLocal('enrollments', enrollments);
      return finalEnrollment;
    }
  },

  deleteEnrollment: async (id: string): Promise<void> => {
    if (useSupabase()) {
      const { error } = await supabase.from('enrollments').delete().eq('id', id);
      if (error) throw error;
    } else {
      const enrollments = getLocal<Enrollment>('enrollments', INITIAL_ENROLLMENTS).filter(e => e.id !== id);
      setLocal('enrollments', enrollments);
    }
  }
};
