import React, { useState } from 'react';
import { 
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
  Building,
  CreditCard,
  AlertCircle,
  Award
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
  onAddInstructor: _onAddInstructor
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
  const totalStudents = students.length;

  // FEE COLLECTION STATS
  const paidStudents = students.filter(s => (s.feeStatus || 'Paid') === 'Paid');
  const partialStudents = students.filter(s => s.feeStatus === 'Partial');
  const pendingStudents = students.filter(s => s.feeStatus === 'Pending');

  const totalExpectedFee = students.reduce((sum, s) => sum + (s.totalFee ?? 45000), 0);
  const totalCollectedFee = students.reduce((sum, s) => sum + (s.paidAmount ?? 45000), 0);
  const totalPendingFee = Math.max(0, totalExpectedFee - totalCollectedFee);
  const feeCollectionRate = totalExpectedFee > 0 ? Math.round((totalCollectedFee / totalExpectedFee) * 100) : 100;

  // MARKS ANALYTICS
  const getNumMark = (mStr?: string): number | null => {
    if (!mStr || mStr === 'NA') return null;
    const val = parseFloat(mStr.replace('%', '').trim());
    return isNaN(val) ? null : val;
  };

  const m10List = students.map(s => getNumMark(s.mark10)).filter((v): v is number => v !== null);
  const m11List = students.map(s => getNumMark(s.mark11)).filter((v): v is number => v !== null);
  const m12List = students.map(s => getNumMark(s.mark12)).filter((v): v is number => v !== null);

  const avg10 = m10List.length > 0 ? (m10List.reduce((a, b) => a + b, 0) / m10List.length).toFixed(1) : 'N/A';
  const avg11 = m11List.length > 0 ? (m11List.reduce((a, b) => a + b, 0) / m11List.length).toFixed(1) : 'N/A';
  const avg12 = m12List.length > 0 ? (m12List.reduce((a, b) => a + b, 0) / m12List.length).toFixed(1) : 'N/A';

  const roomBookings: { [room: string]: number } = {};
  classes.forEach(c => {
    roomBookings[c.room] = (roomBookings[c.room] || 0) + 1;
  });

  const topRooms = Object.entries(roomBookings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const filteredAdminClasses = classes.filter(c => c.scheduleDays.includes(scheduleDayFilter));

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
              {currentRole === 'admin' && 'Student Data & Fee Management Center'}
              {currentRole === 'faculty' && 'Faculty Workspace'}
              {currentRole === 'student' && 'Student Portal & Fee Status'}
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
            {currentRole === 'admin' && 'Department student records, fee collection status, and 10th/11th/12th marks analytics.'}
            {currentRole === 'faculty' && `Managing teaching schedule, course rosters, and grades for ${activeInstructor?.name || 'Faculty'}.`}
            {currentRole === 'student' && `Academic performance, fee payment records, and registered courses for ${activeStudent?.name || 'Student'}.`}
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
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('directory')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Total Student Records</span>
                  <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{totalStudents}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>Browse Student Roster</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('directory')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Total Fees Collected</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹{(totalCollectedFee / 100000).toFixed(2)}L</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>{feeCollectionRate}% Collection Rate</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('directory')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Pending Fees Amount</span>
                  <div className="text-2xl font-extrabold text-rose-400 mt-1">₹{(totalPendingFee / 10000).toFixed(0)}k</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>{pendingStudents.length + partialStudents.length} Students Pending</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between gap-4 shadow-sm" onClick={() => setActiveTab('directory')}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Avg 12th Marks (%)</span>
                  <div className="text-2xl font-extrabold text-sky-400 mt-1">{avg12}%</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                  <Award size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                <span>Cohort Academic Avg</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <span className="text-xs font-bold text-[var(--text-primary)]">Student & Department Actions:</span>
            <div className="flex flex-wrap gap-2">
              {onAddStudent && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-app)] hover:bg-[var(--primary-hover)] text-xs font-semibold transition cursor-pointer" onClick={onAddStudent}>
                  <Plus size={13} /> Add Student Record
                </button>
              )}
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Fee Collection Status Grid */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center justify-between">
                  <span>Student Fee Payment Overview</span>
                  <span className="text-xs font-semibold text-emerald-400">Total Expected: ₹{totalExpectedFee.toLocaleString()}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-4 rounded-lg flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Fee Cleared (Paid)</span>
                    <div className="text-xl font-extrabold text-emerald-400 mt-1">{paidStudents.length} Students</div>
                    <span className="text-[11px] text-[var(--text-muted)] mt-1">₹{(paidStudents.length * 45000).toLocaleString()} Collected</span>
                  </div>

                  <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-4 rounded-lg flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Partially Paid</span>
                    <div className="text-xl font-extrabold text-amber-400 mt-1">{partialStudents.length} Students</div>
                    <span className="text-[11px] text-[var(--text-muted)] mt-1">₹{partialStudents.reduce((sum, s) => sum + (s.paidAmount || 0), 0).toLocaleString()} Received</span>
                  </div>

                  <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-4 rounded-lg flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Pending Payment</span>
                    <div className="text-xl font-extrabold text-rose-400 mt-1">{pendingStudents.length} Students</div>
                    <span className="text-[11px] text-[var(--text-muted)] mt-1">₹{(pendingStudents.length * 45000).toLocaleString()} Outstanding</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${(paidStudents.length / totalStudents) * 100}%` }} title="Paid" />
                  <div className="h-full bg-amber-500" style={{ width: `${(partialStudents.length / totalStudents) * 100}%` }} title="Partial" />
                  <div className="h-full bg-rose-500" style={{ width: `${(pendingStudents.length / totalStudents) * 100}%` }} title="Pending" />
                </div>
              </div>

              {/* Department Daily Schedule */}
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
            </div>

            <div className="flex flex-col gap-6">
              {/* Department Marks Analytics Card */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Cohort Marks Analytics</h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">10th Average Mark</span>
                    <span className="text-sm font-extrabold text-emerald-400">{avg10}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">11th Average Mark</span>
                    <span className="text-sm font-extrabold text-emerald-400">{avg11}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">12th Average Mark</span>
                    <span className="text-sm font-extrabold text-emerald-400">{avg12}%</span>
                  </div>
                </div>
              </div>

              {/* Room Utilization */}
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
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Fee Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-base font-extrabold px-2.5 py-0.5 rounded border ${
                  (activeStudent.feeStatus || 'Paid') === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : (activeStudent.feeStatus || 'Paid') === 'Partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                }`}>
                  {activeStudent.feeStatus || 'Paid'}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] mt-1">Paid: ₹{(activeStudent.paidAmount ?? 45000).toLocaleString()}</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">12th Board Mark</span>
              <div className="text-2xl font-extrabold text-sky-400 mt-1">{activeStudent.mark12 || 'N/A'}</div>
              <span className="text-[11px] text-[var(--text-muted)]">10th: {activeStudent.mark10 || 'N/A'} • 11th: {activeStudent.mark11 || 'N/A'}</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Cumulative GPA</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{studentGpa}</div>
              <span className="text-[11px] text-[var(--text-muted)]">{studentEnrolledCourses.length} Registered Courses</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Roll Number</span>
              <div className="text-sm font-extrabold text-[var(--text-primary)] mt-1">{activeStudent.rollNo || 'N/A'}</div>
              <span className="text-[11px] text-[var(--text-muted)]">{activeStudent.classGroup}</span>
            </div>
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
