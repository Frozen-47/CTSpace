import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  ArrowUpRight,
  MapPin,
  Clock,
  UserCheck,
  Shield,
  GraduationCap,
  Plus,
  Briefcase,
  Building
} from 'lucide-react';
import type { Course, Instructor, Student, ClassInstance, Enrollment } from '../mock/mockData';

interface DashboardProps {
  courses: Course[];
  classes: ClassInstance[];
  instructors: Instructor[];
  students: Student[];
  enrollments: Enrollment[];
  setActiveTab: (tab: string) => void;
  currentRole: 'admin' | 'faculty' | 'student';
  setCurrentRole: (role: 'admin' | 'faculty' | 'student') => void;
  selectedInstructorId: string;
  setSelectedInstructorId: (id: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  onAddCourse?: () => void;
  onAddClass?: () => void;
  onAddStudent?: () => void;
  onAddInstructor?: () => void;
}

const getGradePoint = (grade: string): number | null => {
  const g = grade.trim().toUpperCase();
  if (g === 'A+' || g === 'A') return 4.0;
  if (g === 'A-') return 3.7;
  if (g === 'B+') return 3.3;
  if (g === 'B') return 3.0;
  if (g === 'B-') return 2.7;
  if (g === 'C+') return 2.3;
  if (g === 'C') return 2.0;
  if (g === 'D') return 1.0;
  if (g === 'F') return 0.0;
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({
  courses,
  classes,
  instructors,
  students,
  enrollments,
  setActiveTab,
  currentRole,
  setCurrentRole,
  selectedInstructorId,
  setSelectedInstructorId,
  selectedStudentId,
  setSelectedStudentId,
  onAddCourse,
  onAddClass,
  onAddStudent,
  onAddInstructor
}) => {
  const [scheduleDayFilter, setScheduleDayFilter] = useState<string>('Monday');

  // Selected entities for Faculty and Student contexts
  const activeInstructor = instructors.find(i => i.id === selectedInstructorId) || instructors[0];
  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Helper map for enrollments count per class
  const classEnrollmentCounts: { [classId: string]: number } = {};
  enrollments.forEach(e => {
    classEnrollmentCounts[e.classId] = (classEnrollmentCounts[e.classId] || 0) + 1;
  });

  // ADMIN CALCULATIONS
  const totalCourses = courses.length;
  const activeClasses = classes.length;
  const totalFaculty = instructors.length;
  const totalStudents = students.length;
  const totalEnrollments = enrollments.length;

  const averageClassSize = activeClasses > 0 
    ? Math.round(totalEnrollments / activeClasses * 10) / 10 
    : 0;

  const roomBookings: { [room: string]: number } = {};
  classes.forEach(c => {
    roomBookings[c.room] = (roomBookings[c.room] || 0) + 1;
  });

  const topRooms = Object.entries(roomBookings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const filteredAdminClasses = classes.filter(c => c.scheduleDays.includes(scheduleDayFilter));

  const capacityWarningClasses = classes
    .map(cls => {
      const count = classEnrollmentCounts[cls.id] || 0;
      const course = courses.find(c => c.id === cls.courseId);
      const percent = Math.round((count / cls.capacity) * 100);
      return { cls, course, count, percent };
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);

  // FACULTY CALCULATIONS
  const facultyClasses = activeInstructor 
    ? classes.filter(c => c.instructorId === activeInstructor.id) 
    : [];

  const facultyClassIds = new Set(facultyClasses.map(c => c.id));
  const facultyEnrollments = enrollments.filter(e => facultyClassIds.has(e.classId));
  const uniqueFacultyStudents = new Set(facultyEnrollments.map(e => e.studentId)).size;
  const facultyScheduleToday = facultyClasses.filter(c => c.scheduleDays.includes(scheduleDayFilter));

  // STUDENT CALCULATIONS
  const studentEnrollments = activeStudent 
    ? enrollments.filter(e => e.studentId === activeStudent.id) 
    : [];

  const studentEnrolledClassIds = new Set(studentEnrollments.map(e => e.classId));
  const studentClasses = classes.filter(c => studentEnrolledClassIds.has(c.id));
  
  const studentEnrolledCourses = studentClasses.map(cls => {
    const course = courses.find(c => c.id === cls.courseId);
    const enrollment = studentEnrollments.find(e => e.classId === cls.id);
    const inst = instructors.find(i => i.id === cls.instructorId);
    return { cls, course, enrollment, inst };
  }).filter(item => item.course !== undefined);

  const totalStudentCredits = studentEnrolledCourses.reduce((sum, item) => sum + (item.course?.credits || 0), 0);

  let totalGradePoints = 0;
  let gradedCoursesCount = 0;
  studentEnrollments.forEach(e => {
    const pts = getGradePoint(e.grade);
    if (pts !== null) {
      totalGradePoints += pts;
      gradedCoursesCount += 1;
    }
  });

  const studentGpa = gradedCoursesCount > 0 
    ? (totalGradePoints / gradedCoursesCount).toFixed(2) 
    : 'N/A';

  const studentClassesToday = studentClasses.filter(c => c.scheduleDays.includes(scheduleDayFilter));

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            {currentRole === 'admin' && <Shield size={22} className="text-indigo-400" />}
            {currentRole === 'faculty' && <UserCheck size={22} className="text-emerald-400" />}
            {currentRole === 'student' && <GraduationCap size={22} className="text-sky-400" />}
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {currentRole === 'admin' && 'Department Admin Control Center'}
              {currentRole === 'faculty' && 'Faculty Workspace'}
              {currentRole === 'student' && 'Student Portal'}
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
            {currentRole === 'admin' && 'System analytics, active timetables, and department management.'}
            {currentRole === 'faculty' && `Managing teaching schedule, course rosters, and grades for ${activeInstructor?.name || 'Faculty'}.`}
            {currentRole === 'student' && `Academic performance, class schedule, and enrolled courses for ${activeStudent?.name || 'Student'}.`}
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center bg-[var(--bg-card-hover)] p-1 rounded-lg border border-[var(--border-color)] self-start md:self-auto">
          <button 
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              currentRole === 'admin' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setCurrentRole('admin')}
          >
            <Shield size={14} />
            <span>Admin</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              currentRole === 'faculty' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setCurrentRole('faculty')}
          >
            <UserCheck size={14} />
            <span>Faculty</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              currentRole === 'student' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setCurrentRole('student')}
          >
            <GraduationCap size={14} />
            <span>Student</span>
          </button>
        </div>
      </header>

      {/* Role Profile Selector */}
      {currentRole === 'faculty' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
            <Briefcase size={16} className="text-emerald-400" />
            <span>Active Instructor Profile:</span>
          </div>
          <select 
            className="px-3.5 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-semibold outline-none focus:border-[var(--text-secondary)] transition w-full sm:w-80"
            value={selectedInstructorId || activeInstructor?.id}
            onChange={(e) => setSelectedInstructorId(e.target.value)}
          >
            {instructors.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.title} - {inst.specialization})
              </option>
            ))}
          </select>
        </div>
      )}

      {currentRole === 'student' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
            <GraduationCap size={16} className="text-sky-400" />
            <span>Active Student Profile:</span>
          </div>
          <select 
            className="px-3.5 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-semibold outline-none focus:border-[var(--text-secondary)] transition w-full sm:w-80"
            value={selectedStudentId || activeStudent?.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map(stud => (
              <option key={stud.id} value={stud.id}>
                {stud.name} ({stud.classGroup})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 1. ADMIN DASHBOARD VIEW */}
      {currentRole === 'admin' && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('courses')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Courses Offered</span>
                  <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{totalCourses}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>View catalog</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('schedule')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Active Class Slots</span>
                  <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{activeClasses}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>View timetable</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('directory')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Faculty Roster</span>
                  <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{totalFaculty}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>View faculty</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('directory')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Total Enrolled Students</span>
                  <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{totalStudents}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>Student directory</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <span className="text-xs font-bold text-[var(--text-primary)]">Quick Department Actions:</span>
            <div className="flex flex-wrap gap-2">
              {onAddCourse && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer" onClick={onAddCourse}>
                  <Plus size={13} /> Add Course
                </button>
              )}
              {onAddClass && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer" onClick={onAddClass}>
                  <Plus size={13} /> Schedule Class
                </button>
              )}
              {onAddInstructor && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer" onClick={onAddInstructor}>
                  <Plus size={13} /> Add Instructor
                </button>
              )}
              {onAddStudent && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer" onClick={onAddStudent}>
                  <Plus size={13} /> Add Student
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Department Daily Schedule</h2>
                  <div className="flex items-center gap-1 bg-[var(--bg-card-hover)] p-1 rounded-lg border border-[var(--border-color)]">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <button
                        key={day}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          scheduleDayFilter === day 
                            ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                        onClick={() => setScheduleDayFilter(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredAdminClasses.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {filteredAdminClasses.map(cls => {
                      const course = courses.find(c => c.id === cls.courseId);
                      const inst = instructors.find(i => i.id === cls.instructorId);
                      const count = classEnrollmentCounts[cls.id] || 0;
                      return (
                        <div key={cls.id} className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-[130px] font-medium">
                              <Clock size={12} />
                              <span>{cls.scheduleTime}</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-[var(--text-primary)]">{course?.code}: {course?.name}</h3>
                              <span className="text-xs text-[var(--text-secondary)]">{inst?.title} {inst?.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
                              <MapPin size={10} />
                              {cls.room}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {count}/{cls.capacity} Enrolled
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic text-center py-6">No scheduled classes on {scheduleDayFilter}.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">Average Class Size</span>
                  <div className="text-3xl font-extrabold text-[var(--text-primary)] my-2">{averageClassSize}</div>
                  <span className="text-[11px] text-[var(--text-muted)]">Students per scheduled section</span>
                  <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(averageClassSize * 4, 100)}%` }} />
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Seat Capacity Utilization</span>
                  <div className="text-3xl font-extrabold text-[var(--text-primary)] my-2">
                    {Math.round((totalEnrollments / (classes.reduce((sum, c) => sum + c.capacity, 0) || 1)) * 100)}%
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">Overall department seat usage</span>
                  <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(Math.round((totalEnrollments / (classes.reduce((sum, c) => sum + c.capacity, 0) || 1)) * 100), 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Highest Capacity Classes</h2>
                <div className="flex flex-col divide-y divide-[var(--border-color)]">
                  {capacityWarningClasses.map(({ cls, course, count, percent }) => (
                    <div key={cls.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{course?.code} (Room {cls.room})</h4>
                        <span className="text-[11px] text-[var(--text-muted)]">{count}/{cls.capacity} seats filled</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${percent >= 90 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Top Room Utilization</h2>
                <div className="flex flex-col divide-y divide-[var(--border-color)]">
                  {topRooms.map(([room, count]) => (
                    <div key={room} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-[var(--text-muted)]" />
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">Room {room}</h4>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">{count} class slots</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. FACULTY DASHBOARD VIEW */}
      {currentRole === 'faculty' && activeInstructor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Assigned Courses</span>
                <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{facultyClasses.length}</div>
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Students Taught</span>
                <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{uniqueFacultyStudents}</div>
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Office Hours Location</span>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-2 truncate">{activeInstructor.office || 'TBD'}</div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Teaching Schedule ({scheduleDayFilter})</h2>
                <div className="flex items-center gap-1 bg-[var(--bg-card-hover)] p-1 rounded-lg border border-[var(--border-color)]">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <button
                      key={day}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                        scheduleDayFilter === day 
                          ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      onClick={() => setScheduleDayFilter(day)}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {facultyScheduleToday.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {facultyScheduleToday.map(cls => {
                    const course = courses.find(c => c.id === cls.courseId);
                    const count = classEnrollmentCounts[cls.id] || 0;
                    return (
                      <div key={cls.id} className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium">
                            <Clock size={12} />
                            <span>{cls.scheduleTime}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">{course?.code}: {course?.name}</h3>
                            <span className="text-xs text-[var(--text-secondary)]">Group {cls.classGroup}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                            Room {cls.room}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {count} Students
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic text-center py-6">No teaching sessions scheduled on {scheduleDayFilter}.</p>
              )}
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Course Rosters Preview</h2>
              <div className="flex flex-col gap-4">
                {facultyClasses.map(cls => {
                  const course = courses.find(c => c.id === cls.courseId);
                  const enrolled = enrollments
                    .filter(e => e.classId === cls.id)
                    .map(e => ({ student: students.find(s => s.id === e.studentId), enrollment: e }))
                    .filter(item => item.student !== undefined);

                  return (
                    <div key={cls.id} className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-card-hover)]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-[var(--text-primary)]">{course?.code} - {course?.name} (Room {cls.room})</h3>
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">{enrolled.length} Enrolled</span>
                      </div>

                      {enrolled.length > 0 ? (
                        <div className="flex flex-col gap-1 text-xs">
                          {enrolled.slice(0, 5).map(({ student, enrollment }) => (
                            <div key={enrollment.id} className="flex items-center justify-between py-1 border-b border-[var(--border-color)] last:border-none">
                              <span className="font-medium text-[var(--text-primary)]">{student?.name}</span>
                              <span className="text-[var(--text-secondary)]">{student?.classGroup}</span>
                              <span className="font-semibold text-emerald-400">{enrollment.grade || 'IP'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] italic">No students currently enrolled in this class section.</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Faculty Tools</h2>
              <div className="flex flex-col gap-2">
                <button className="w-full text-left px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card-hover)] hover:bg-[var(--bg-active)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 transition cursor-pointer" onClick={() => setActiveTab('directory')}>
                  <Users size={14} /> View Student Directory
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card-hover)] hover:bg-[var(--bg-active)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 transition cursor-pointer" onClick={() => setActiveTab('schedule')}>
                  <Calendar size={14} /> View Department Timetable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STUDENT DASHBOARD VIEW */}
      {currentRole === 'student' && activeStudent && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Enrolled Courses</span>
              <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{studentEnrolledCourses.length}</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Credits</span>
              <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{totalStudentCredits}</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Cumulative GPA</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{studentGpa}</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Cohort</span>
              <div className="text-sm font-bold text-[var(--text-primary)] mt-2">{activeStudent.classGroup}</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">My Daily Timetable ({scheduleDayFilter})</h2>
              <div className="flex items-center gap-1 bg-[var(--bg-card-hover)] p-1 rounded-lg border border-[var(--border-color)]">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <button
                    key={day}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      scheduleDayFilter === day 
                        ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    onClick={() => setScheduleDayFilter(day)}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {studentClassesToday.length > 0 ? (
              <div className="flex flex-col gap-3">
                {studentClassesToday.map(cls => {
                  const course = courses.find(c => c.id === cls.courseId);
                  const inst = instructors.find(i => i.id === cls.instructorId);
                  return (
                    <div key={cls.id} className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium">
                          <Clock size={12} />
                          <span>{cls.scheduleTime}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">{course?.code}: {course?.name}</h3>
                          <span className="text-xs text-[var(--text-secondary)]">Instructor: {inst?.title} {inst?.name}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                        Room {cls.room}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic text-center py-6">No classes scheduled on {scheduleDayFilter}.</p>
            )}
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">My Enrolled Courses & Grades</h2>
            {studentEnrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentEnrolledCourses.map(({ cls, course, enrollment, inst }) => (
                  <div key={cls.id} className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{course?.code}</span>
                        <span className="text-xs font-bold text-emerald-400">Grade: {enrollment?.grade || 'IP'}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{course?.name}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-1">{course?.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-2 text-[11px] text-[var(--text-muted)] font-medium">
                      <span>{inst?.name}</span>
                      <span>{course?.credits} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 text-xs text-[var(--text-muted)]">No registered courses found for this student.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
