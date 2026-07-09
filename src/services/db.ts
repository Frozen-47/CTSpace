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

// --- Database Operations ---

export const db = {
  // Reset database to initial seeds
  resetDatabase: async (): Promise<void> => {
    if (useSupabase()) {
      // For Supabase, reset wouldn't normally be fully automatic unless tables are cleared,
      // but in this configuration we just reset localStorage.
      console.warn("Reset operation is only available in mock mode.");
    }
    localStorage.removeItem('ctspace_courses');
    localStorage.removeItem('ctspace_instructors');
    localStorage.removeItem('ctspace_students');
    localStorage.removeItem('ctspace_classes');
    localStorage.removeItem('ctspace_enrollments');
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
      return data;
    }
    return getLocal<Student>('students', INITIAL_STUDENTS).sort((a, b) => a.name.localeCompare(b.name));
  },

  saveStudent: async (student: Omit<Student, 'id'> & { id?: string }): Promise<Student> => {
    if (useSupabase()) {
      if (student.id) {
        const { data, error } = await supabase.from('students').update(student).eq('id', student.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('students').insert(student).select().single();
        if (error) throw error;
        return data;
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
      return data;
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
      if (cls.id) {
        const { data, error } = await supabase.from('classes').update(cls).eq('id', cls.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('classes').insert(cls).select().single();
        if (error) throw error;
        return data;
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
      return data;
    }
    return getLocal<Enrollment>('enrollments', INITIAL_ENROLLMENTS);
  },

  saveEnrollment: async (enrollment: Omit<Enrollment, 'id'> & { id?: string }): Promise<Enrollment> => {
    if (useSupabase()) {
      if (enrollment.id) {
        const { data, error } = await supabase.from('enrollments').update(enrollment).eq('id', enrollment.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('enrollments').insert(enrollment).select().single();
        if (error) throw error;
        return data;
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
