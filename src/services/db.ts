import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase';
import {
  type Course, type Instructor, type Student, type ClassInstance, type Enrollment,
  INITIAL_COURSES, INITIAL_INSTRUCTORS, INITIAL_STUDENTS, INITIAL_CLASSES, INITIAL_ENROLLMENTS
} from '../mock/mockData';

// Initialize Supabase client
let supabase: any = null;
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  try {
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

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
    if (classId && cls.id === classId) continue;
    
    if (cls.term === term && days.some(d => cls.scheduleDays.includes(d))) {
      if (timesOverlap(cls.scheduleTime, time)) {
        if (cls.instructorId === instructorId) {
          return {
            conflict: true,
            type: 'instructor',
            message: `Instructor is already scheduled for another class during this timeslot (${cls.scheduleTime} on ${cls.scheduleDays.join('/')}).`
          };
        }
        if (cls.room.toLowerCase() === room.toLowerCase()) {
          return {
            conflict: true,
            type: 'room',
            message: `Room "${cls.room}" is already booked for another class during this timeslot.`
          };
        }
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
  sNo: row.s_no ?? row.sNo,
  rollNo: row.roll_no || row.rollNo,
  name: row.name,
  email: row.email,
  classGroup: row.class_group || row.classGroup,
  mark10: row.mark_10 || row.mark10,
  mark11: row.mark_11 || row.mark11,
  mark12: row.mark_12 || row.mark12,
  group: row.group,
  medium: row.medium,
  bloodGroup: row.blood_group || row.bloodGroup,
  dob: row.dob,
  phone: row.phone,
  linkedin: row.linkedin,
  github: row.github,
  projectDrive: row.project_drive || row.projectDrive,
  feeStatus: row.fee_status || row.feeStatus || 'Paid',
  totalFee: row.total_fee ?? row.totalFee ?? 45000,
  paidAmount: row.paid_amount ?? row.paidAmount ?? 45000,
  dueDate: row.due_date || row.dueDate || 'Cleared'
});

const mapStudentToDb = (s: Partial<Student>) => {
  const payload: any = { ...s };
  if (payload.sNo !== undefined) { payload.s_no = payload.sNo; delete payload.sNo; }
  if (payload.rollNo !== undefined) { payload.roll_no = payload.rollNo; delete payload.rollNo; }
  if (payload.classGroup !== undefined) { payload.class_group = payload.classGroup; delete payload.classGroup; }
  if (payload.mark10 !== undefined) { payload.mark_10 = payload.mark10; delete payload.mark10; }
  if (payload.mark11 !== undefined) { payload.mark_11 = payload.mark11; delete payload.mark11; }
  if (payload.mark12 !== undefined) { payload.mark_12 = payload.mark12; delete payload.mark12; }
  if (payload.bloodGroup !== undefined) { payload.blood_group = payload.bloodGroup; delete payload.bloodGroup; }
  if (payload.projectDrive !== undefined) { payload.project_drive = payload.projectDrive; delete payload.projectDrive; }
  if (payload.feeStatus !== undefined) { payload.fee_status = payload.feeStatus; delete payload.feeStatus; }
  if (payload.totalFee !== undefined) { payload.total_fee = payload.totalFee; delete payload.totalFee; }
  if (payload.paidAmount !== undefined) { payload.paid_amount = payload.paidAmount; delete payload.paidAmount; }
  if (payload.dueDate !== undefined) { payload.due_date = payload.dueDate; delete payload.dueDate; }
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

// Auto-seed empty Supabase tables
const fetchOrSeedTable = async (tableName: string, mapToDbFn: (item: any) => any, seedData: any[]) => {
  if (!supabase) return seedData;
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (!error && data && data.length > 0) {
      return data;
    }
    // Table empty or missing - attempt seed insertion
    const payload = seedData.map(mapToDbFn);
    const { error: seedError } = await supabase.from(tableName).insert(payload);
    if (!seedError) {
      const { data: fresh } = await supabase.from(tableName).select('*');
      if (fresh && fresh.length > 0) return fresh;
    }
  } catch (err) {
    console.warn(`Supabase ${tableName} query error, utilizing initial data:`, err);
  }
  return seedData;
};

// --- Exclusive Supabase Database Service ---

export const db = {
  // Re-seed Supabase tables
  resetDatabase: async (): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('enrollments').delete().neq('id', '0');
      await supabase.from('classes').delete().neq('id', '0');
      await supabase.from('students').delete().neq('id', '0');
      await supabase.from('instructors').delete().neq('id', '0');
      await supabase.from('courses').delete().neq('id', '0');

      await supabase.from('courses').insert(INITIAL_COURSES);
      await supabase.from('instructors').insert(INITIAL_INSTRUCTORS);
      await supabase.from('students').insert(INITIAL_STUDENTS.map(mapStudentToDb));
      await supabase.from('classes').insert(INITIAL_CLASSES.map(mapClassToDb));
      await supabase.from('enrollments').insert(INITIAL_ENROLLMENTS.map(mapEnrollmentToDb));
    } catch (err) {
      console.error("Supabase database reset error:", err);
      throw err;
    }
  },

  // Export database JSON
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

  // Import database JSON directly to Supabase
  importDatabaseJSON: async (jsonString: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON format.');

    if (Array.isArray(parsed.courses) && parsed.courses.length > 0) {
      await supabase.from('courses').upsert(parsed.courses);
    }
    if (Array.isArray(parsed.instructors) && parsed.instructors.length > 0) {
      await supabase.from('instructors').upsert(parsed.instructors);
    }
    if (Array.isArray(parsed.students) && parsed.students.length > 0) {
      await supabase.from('students').upsert(parsed.students.map(mapStudentToDb));
    }
    if (Array.isArray(parsed.classes) && parsed.classes.length > 0) {
      await supabase.from('classes').upsert(parsed.classes.map(mapClassToDb));
    }
    if (Array.isArray(parsed.enrollments) && parsed.enrollments.length > 0) {
      await supabase.from('enrollments').upsert(parsed.enrollments.map(mapEnrollmentToDb));
    }
  },

  // Courses CRUD
  getCourses: async (): Promise<Course[]> => {
    const raw = await fetchOrSeedTable('courses', item => item, INITIAL_COURSES);
    return raw.sort((a: Course, b: Course) => a.code.localeCompare(b.code));
  },

  saveCourse: async (course: Omit<Course, 'id'> & { id?: string }): Promise<Course> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    if (course.id) {
      const { data, error } = await supabase.from('courses').update(course).eq('id', course.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('courses').insert(course).select().single();
      if (error) throw error;
      return data;
    }
  },

  deleteCourse: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },

  // Instructors CRUD
  getInstructors: async (): Promise<Instructor[]> => {
    const raw = await fetchOrSeedTable('instructors', item => item, INITIAL_INSTRUCTORS);
    return raw.sort((a: Instructor, b: Instructor) => a.name.localeCompare(b.name));
  },

  saveInstructor: async (instructor: Omit<Instructor, 'id'> & { id?: string }): Promise<Instructor> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    if (instructor.id) {
      const { data, error } = await supabase.from('instructors').update(instructor).eq('id', instructor.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('instructors').insert(instructor).select().single();
      if (error) throw error;
      return data;
    }
  },

  deleteInstructor: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase.from('instructors').delete().eq('id', id);
    if (error) throw error;
  },

  // Students CRUD
  getStudents: async (): Promise<Student[]> => {
    const raw = await fetchOrSeedTable('students', mapStudentToDb, INITIAL_STUDENTS);
    return (raw || []).map(mapStudentFromDb);
  },

  saveStudent: async (student: Omit<Student, 'id'> & { id?: string }): Promise<Student> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
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
  },

  deleteStudent: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  },

  // Classes CRUD
  getClasses: async (): Promise<ClassInstance[]> => {
    const raw = await fetchOrSeedTable('classes', mapClassToDb, INITIAL_CLASSES);
    return (raw || []).map(mapClassFromDb);
  },

  saveClass: async (cls: Omit<ClassInstance, 'id'> & { id?: string }): Promise<ClassInstance> => {
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

    if (!supabase) throw new Error("Supabase client not initialized.");
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
  },

  deleteClass: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
  },

  // Enrollments CRUD
  getEnrollments: async (): Promise<Enrollment[]> => {
    const raw = await fetchOrSeedTable('enrollments', mapEnrollmentToDb, INITIAL_ENROLLMENTS);
    return (raw || []).map(mapEnrollmentFromDb);
  },

  saveEnrollment: async (enrollment: Omit<Enrollment, 'id'> & { id?: string }): Promise<Enrollment> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
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
  },

  deleteEnrollment: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase.from('enrollments').delete().eq('id', id);
    if (error) throw error;
  }
};
