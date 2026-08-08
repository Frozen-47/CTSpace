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
  Award,
  BookMarked,
  CheckCircle2,
  Briefcase,
  Mail,
  Building,
  User
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
  return null; // IP or unassigned
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

  // -------------------------------------------------------------
  // ADMIN CALCULATIONS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // FACULTY CALCULATIONS
  // -------------------------------------------------------------
  const facultyClasses = activeInstructor 
    ? classes.filter(c => c.instructorId === activeInstructor.id) 
    : [];

  const facultyClassIds = new Set(facultyClasses.map(c => c.id));
  const facultyEnrollments = enrollments.filter(e => facultyClassIds.has(e.classId));
  const uniqueFacultyStudents = new Set(facultyEnrollments.map(e => e.studentId)).size;

  const facultyScheduleToday = facultyClasses.filter(c => c.scheduleDays.includes(scheduleDayFilter));

  // -------------------------------------------------------------
  // STUDENT CALCULATIONS
  // -------------------------------------------------------------
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

  // Calculate GPA
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
    <div className="dashboard-view animate-fade-in">
      {/* Dynamic Role Switcher Header Bar */}
      <header className="role-dashboard-header">
        <div className="header-titles">
          <div className="role-badge-title">
            {currentRole === 'admin' && <Shield size={20} className="role-icon admin" />}
            {currentRole === 'faculty' && <UserCheck size={20} className="role-icon faculty" />}
            {currentRole === 'student' && <GraduationCap size={20} className="role-icon student" />}
            <h1>
              {currentRole === 'admin' && 'Department Admin Control Center'}
              {currentRole === 'faculty' && 'Faculty Workspace'}
              {currentRole === 'student' && 'Student Portal'}
            </h1>
          </div>
          <p className="subtitle">
            {currentRole === 'admin' && 'System analytics, active timetables, and department management.'}
            {currentRole === 'faculty' && `Managing teaching schedule, course rosters, and grades for ${activeInstructor?.name || 'Faculty'}.`}
            {currentRole === 'student' && `Academic performance, class schedule, and enrolled courses for ${activeStudent?.name || 'Student'}.`}
          </p>
        </div>

        {/* Segmented Control Role Switcher */}
        <div className="role-segmented-switcher">
          <button 
            className={`segmented-btn ${currentRole === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentRole('admin')}
          >
            <Shield size={15} />
            <span>Admin</span>
          </button>
          <button 
            className={`segmented-btn ${currentRole === 'faculty' ? 'active' : ''}`}
            onClick={() => setCurrentRole('faculty')}
          >
            <UserCheck size={15} />
            <span>Faculty</span>
          </button>
          <button 
            className={`segmented-btn ${currentRole === 'student' ? 'active' : ''}`}
            onClick={() => setCurrentRole('student')}
          >
            <GraduationCap size={15} />
            <span>Student</span>
          </button>
        </div>
      </header>

      {/* Role Identity Selector Bar (For Faculty & Student roles) */}
      {currentRole === 'faculty' && (
        <div className="context-selector-bar card">
          <div className="context-label">
            <Briefcase size={16} />
            <span>Active Instructor Profile:</span>
          </div>
          <select 
            className="form-select profile-select"
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
        <div className="context-selector-bar card">
          <div className="context-label">
            <GraduationCap size={16} />
            <span>Active Student Profile:</span>
          </div>
          <select 
            className="form-select profile-select"
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

      {/* ======================================================= */}
      {/* 1. ADMIN DASHBOARD VIEW                                */}
      {/* ======================================================= */}
      {currentRole === 'admin' && (
        <>
          <section className="stats-grid">
            <div className="stat-card card" onClick={() => setActiveTab('courses')}>
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Courses Offered</span>
                  <span className="stat-value">{totalCourses}</span>
                </div>
                <div className="stat-icon"><BookOpen size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>View catalog</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="stat-card card" onClick={() => setActiveTab('schedule')}>
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Active Class Slots</span>
                  <span className="stat-value">{activeClasses}</span>
                </div>
                <div className="stat-icon"><Calendar size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>View timetable</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="stat-card card" onClick={() => setActiveTab('directory')}>
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Faculty Roster</span>
                  <span className="stat-value">{totalFaculty}</span>
                </div>
                <div className="stat-icon"><Users size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>View faculty</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="stat-card card" onClick={() => setActiveTab('directory')}>
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Total Enrolled Students</span>
                  <span className="stat-value">{totalStudents}</span>
                </div>
                <div className="stat-icon"><UserCheck size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Student directory</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          </section>

          {/* Admin Quick Action Buttons */}
          <div className="admin-actions-bar card">
            <span className="actions-title">Quick Department Actions:</span>
            <div className="actions-buttons">
              {onAddCourse && (
                <button className="btn btn-secondary" onClick={onAddCourse}>
                  <Plus size={14} /> Add Course
                </button>
              )}
              {onAddClass && (
                <button className="btn btn-secondary" onClick={onAddClass}>
                  <Plus size={14} /> Schedule Class
                </button>
              )}
              {onAddInstructor && (
                <button className="btn btn-secondary" onClick={onAddInstructor}>
                  <Plus size={14} /> Add Instructor
                </button>
              )}
              {onAddStudent && (
                <button className="btn btn-secondary" onClick={onAddStudent}>
                  <Plus size={14} /> Add Student
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-layout">
            <div className="layout-col main-col">
              <div className="card timetable-card">
                <div className="card-header">
                  <h2>Master Timetable Stream</h2>
                  <div className="day-picker">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <button
                        key={day}
                        className={`day-btn ${scheduleDayFilter === day ? 'active' : ''}`}
                        onClick={() => setScheduleDayFilter(day)}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="timeline">
                  {filteredAdminClasses.length > 0 ? (
                    filteredAdminClasses.map(cls => {
                      const course = courses.find(c => c.id === cls.courseId);
                      const inst = instructors.find(i => i.id === cls.instructorId);
                      const count = classEnrollmentCounts[cls.id] || 0;
                      return (
                        <div key={cls.id} className="timeline-item">
                          <div className="timeline-time">
                            <Clock size={12} />
                            <span>{cls.scheduleTime}</span>
                          </div>
                          <div className="timeline-content">
                            <div className="class-info">
                              <h3>{course?.code}: {course?.name}</h3>
                              <span className="instructor-label">
                                Instructor: {inst ? `${inst.title} ${inst.name}` : 'Unassigned'} • Cohort: {cls.classGroup}
                              </span>
                            </div>
                            <div className="class-meta-badges">
                              <span className="room-label">
                                <MapPin size={12} />
                                <span>{cls.room}</span>
                              </span>
                              <span className="badge badge-info">{count} / {cls.capacity} Enrolled</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <p>No classes scheduled for {scheduleDayFilter}.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card metrics-card">
                <div className="card-header">
                  <h2>Department Key Indicators</h2>
                </div>
                <div className="metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Average Class Size</span>
                    <span className="metric-num">{averageClassSize}</span>
                    <span className="metric-subtitle">students enrolled per class slot</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min((averageClassSize / 40) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Total Registered Seats</span>
                    <span className="metric-num">{totalEnrollments}</span>
                    <span className="metric-subtitle">across all terms & courses</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min((totalEnrollments / 100) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="layout-col side-col">
              <div className="card list-card">
                <div className="card-header">
                  <h2>Capacity & Fill Rates</h2>
                </div>
                <div className="popularity-list">
                  {capacityWarningClasses.length > 0 ? (
                    capacityWarningClasses.map(item => (
                      <div key={item.cls.id} className="popularity-item">
                        <div className="item-details">
                          <span className="course-code-tag">{item.course?.code || 'CS'}</span>
                          <div className="course-name-text">
                            <h4>{item.course?.name || 'Course'}</h4>
                            <span>{item.count} / {item.cls.capacity} seats taken</span>
                          </div>
                        </div>
                        <span className={`badge ${item.percent >= 90 ? 'badge-danger' : item.percent >= 75 ? 'badge-warning' : 'badge-info'}`}>
                          {item.percent}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state"><p>No class records.</p></div>
                  )}
                </div>
              </div>

              <div className="card list-card">
                <div className="card-header">
                  <h2>Classroom Usage</h2>
                </div>
                <div className="room-list">
                  {topRooms.length > 0 ? (
                    topRooms.map(([room, count]) => (
                      <div key={room} className="room-item">
                        <div className="room-details">
                          <MapPin size={14} className="room-icon" />
                          <div>
                            <h4>{room}</h4>
                            <span>Primary teaching room</span>
                          </div>
                        </div>
                        <span className="badge badge-info">{count} {count === 1 ? 'slot' : 'slots'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state"><p>No classes scheduled.</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================================================= */}
      {/* 2. FACULTY DASHBOARD VIEW                               */}
      {/* ======================================================= */}
      {currentRole === 'faculty' && (
        <>
          {/* Faculty Overview Header Card */}
          {activeInstructor && (
            <div className="profile-banner-card card">
              <div className="profile-main-info">
                <div className="profile-avatar faculty-avatar">
                  <UserCheck size={28} />
                </div>
                <div>
                  <h2>{activeInstructor.name}</h2>
                  <span className="profile-title">{activeInstructor.title} • {activeInstructor.specialization}</span>
                  <div className="profile-details-pills">
                    <span><Mail size={12} /> {activeInstructor.email}</span>
                    <span><Building size={12} /> Office: {activeInstructor.office}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Faculty Stats Grid */}
          <section className="stats-grid">
            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Assigned Classes</span>
                  <span className="stat-value">{facultyClasses.length}</span>
                </div>
                <div className="stat-icon"><BookMarked size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Active teaching slots</span>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Students Taught</span>
                  <span className="stat-value">{uniqueFacultyStudents}</span>
                </div>
                <div className="stat-icon"><Users size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Across assigned courses</span>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Total Enrolled Seats</span>
                  <span className="stat-value">{facultyEnrollments.length}</span>
                </div>
                <div className="stat-icon"><CheckCircle2 size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Active class seats</span>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Primary Office</span>
                  <span className="stat-value" style={{ fontSize: '1.1rem', marginTop: '6px' }}>
                    {activeInstructor?.office || 'Tech Hall'}
                  </span>
                </div>
                <div className="stat-icon"><MapPin size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Faculty office location</span>
              </div>
            </div>
          </section>

          <div className="dashboard-layout">
            <div className="layout-col main-col">
              {/* Teaching Timetable */}
              <div className="card timetable-card">
                <div className="card-header">
                  <h2>My Teaching Schedule</h2>
                  <div className="day-picker">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <button
                        key={day}
                        className={`day-btn ${scheduleDayFilter === day ? 'active' : ''}`}
                        onClick={() => setScheduleDayFilter(day)}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="timeline">
                  {facultyScheduleToday.length > 0 ? (
                    facultyScheduleToday.map(cls => {
                      const course = courses.find(c => c.id === cls.courseId);
                      const count = classEnrollmentCounts[cls.id] || 0;
                      return (
                        <div key={cls.id} className="timeline-item">
                          <div className="timeline-time">
                            <Clock size={12} />
                            <span>{cls.scheduleTime}</span>
                          </div>
                          <div className="timeline-content">
                            <div className="class-info">
                              <h3>{course?.code}: {course?.name}</h3>
                              <span className="instructor-label">
                                Cohort: {cls.classGroup} • Term: {cls.term}
                              </span>
                            </div>
                            <div className="class-meta-badges">
                              <span className="room-label">
                                <MapPin size={12} />
                                <span>{cls.room}</span>
                              </span>
                              <span className="badge badge-info">{count} / {cls.capacity} Students</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <p>No teaching lectures scheduled for {scheduleDayFilter}.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Roster Overview */}
              <div className="card list-card">
                <div className="card-header">
                  <h2>Assigned Courses & Roster Overview</h2>
                </div>
                <div className="faculty-courses-list">
                  {facultyClasses.length > 0 ? (
                    facultyClasses.map(cls => {
                      const course = courses.find(c => c.id === cls.courseId);
                      const classEnr = enrollments.filter(e => e.classId === cls.id);
                      return (
                        <div key={cls.id} className="faculty-course-box">
                          <div className="course-box-header">
                            <div>
                              <span className="course-code-tag">{course?.code}</span>
                              <h3 className="course-title-text">{course?.name}</h3>
                            </div>
                            <div className="course-box-meta">
                              <span className="badge badge-info">{cls.room}</span>
                              <span className="badge badge-success">{classEnr.length} Enrolled</span>
                            </div>
                          </div>

                          <div className="roster-preview-table">
                            <div className="roster-table-header">
                              <span>Student Name</span>
                              <span>Class Group</span>
                              <span>Grade Status</span>
                            </div>
                            {classEnr.length > 0 ? (
                              classEnr.map(enr => {
                                const stud = students.find(s => s.id === enr.studentId);
                                return (
                                  <div key={enr.id} className="roster-table-row">
                                    <span className="student-name">{stud?.name || 'Unknown Student'}</span>
                                    <span className="student-group">{stud?.classGroup}</span>
                                    <span className={`badge ${enr.grade === 'IP' ? 'badge-warning' : 'badge-success'}`}>
                                      {enr.grade === 'IP' ? 'In Progress' : `Grade: ${enr.grade}`}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="empty-state"><p>No students enrolled in this section.</p></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <p>This instructor currently has no assigned classes.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="layout-col side-col">
              <div className="card">
                <div className="card-header">
                  <h2>Faculty Quick Tools</h2>
                </div>
                <div className="faculty-tools">
                  <button className="btn btn-secondary tool-btn" onClick={() => setActiveTab('schedule')}>
                    <Calendar size={15} /> Full Schedule Matrix
                  </button>
                  <button className="btn btn-secondary tool-btn" onClick={() => setActiveTab('directory')}>
                    <Users size={15} /> Student & Faculty Directory
                  </button>
                  <button className="btn btn-secondary tool-btn" onClick={() => setActiveTab('courses')}>
                    <BookOpen size={15} /> Browse Syllabus Catalog
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================================================= */}
      {/* 3. STUDENT DASHBOARD VIEW                               */}
      {/* ======================================================= */}
      {currentRole === 'student' && (
        <>
          {/* Student Banner Card */}
          {activeStudent && (
            <div className="profile-banner-card card">
              <div className="profile-main-info">
                <div className="profile-avatar student-avatar">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h2>{activeStudent.name}</h2>
                  <span className="profile-title">Cohort: {activeStudent.classGroup}</span>
                  <div className="profile-details-pills">
                    <span><Mail size={12} /> {activeStudent.email}</span>
                    <span><User size={12} /> ID: {activeStudent.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Stats */}
          <section className="stats-grid">
            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Enrolled Courses</span>
                  <span className="stat-value">{studentEnrolledCourses.length}</span>
                </div>
                <div className="stat-icon"><BookMarked size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Active semester courses</span>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Semester Credits</span>
                  <span className="stat-value">{totalStudentCredits}</span>
                </div>
                <div className="stat-icon"><Award size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Total credit hours</span>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Cumulative GPA</span>
                  <span className="stat-value">{studentGpa}</span>
                </div>
                <div className="stat-icon"><CheckCircle2 size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Graded course average</span>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-title">Lectures Today</span>
                  <span className="stat-value">{studentClassesToday.length}</span>
                </div>
                <div className="stat-icon"><Calendar size={18} /></div>
              </div>
              <div className="stat-footer">
                <span>Scheduled for {scheduleDayFilter}</span>
              </div>
            </div>
          </section>

          <div className="dashboard-layout">
            <div className="layout-col main-col">
              {/* Student Personal Schedule */}
              <div className="card timetable-card">
                <div className="card-header">
                  <h2>My Class Timetable</h2>
                  <div className="day-picker">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <button
                        key={day}
                        className={`day-btn ${scheduleDayFilter === day ? 'active' : ''}`}
                        onClick={() => setScheduleDayFilter(day)}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="timeline">
                  {studentClassesToday.length > 0 ? (
                    studentClassesToday.map(cls => {
                      const course = courses.find(c => c.id === cls.courseId);
                      const inst = instructors.find(i => i.id === cls.instructorId);
                      return (
                        <div key={cls.id} className="timeline-item">
                          <div className="timeline-time">
                            <Clock size={12} />
                            <span>{cls.scheduleTime}</span>
                          </div>
                          <div className="timeline-content">
                            <div className="class-info">
                              <h3>{course?.code}: {course?.name}</h3>
                              <span className="instructor-label">
                                Instructor: {inst ? `${inst.title} ${inst.name}` : 'Unassigned'} ({inst?.office})
                              </span>
                            </div>
                            <div className="class-meta-badges">
                              <span className="room-label">
                                <MapPin size={12} />
                                <span>{cls.room}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <p>No lectures scheduled for {activeStudent?.name} on {scheduleDayFilter}.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Enrolled Courses */}
              <div className="card list-card">
                <div className="card-header">
                  <h2>My Academic Record & Enrolled Courses</h2>
                </div>
                <div className="student-courses-grid">
                  {studentEnrolledCourses.length > 0 ? (
                    studentEnrolledCourses.map(({ cls, course, enrollment, inst }) => (
                      <div key={cls.id} className="student-course-card">
                        <div className="course-card-top">
                          <span className="course-code-tag">{course?.code}</span>
                          <span className={`badge ${enrollment?.grade === 'IP' ? 'badge-warning' : 'badge-success'}`}>
                            {enrollment?.grade === 'IP' ? 'In Progress' : `Grade: ${enrollment?.grade}`}
                          </span>
                        </div>
                        <h4>{course?.name}</h4>
                        <p className="course-desc-text">{course?.description}</p>
                        <div className="course-card-bottom">
                          <div className="instructor-mini">
                            <UserCheck size={12} />
                            <span>{inst?.name}</span>
                          </div>
                          <span className="credits-tag">{course?.credits} Credits</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>This student is not currently enrolled in any courses.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="layout-col side-col">
              <div className="card">
                <div className="card-header">
                  <h2>Student Tools</h2>
                </div>
                <div className="student-tools">
                  <button className="btn btn-secondary tool-btn" onClick={() => setActiveTab('schedule')}>
                    <Calendar size={15} /> View Master Schedule
                  </button>
                  <button className="btn btn-secondary tool-btn" onClick={() => setActiveTab('courses')}>
                    <BookOpen size={15} /> Explore All Courses
                  </button>
                  <button className="btn btn-secondary tool-btn" onClick={() => setActiveTab('directory')}>
                    <Users size={15} /> Contact Faculty
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Styled JSX */}
      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .role-dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
        }

        .role-badge-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .role-badge-title h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .role-icon {
          padding: 6px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
        }

        .role-icon.admin { color: var(--info); }
        .role-icon.faculty { color: var(--success); }
        .role-icon.student { color: var(--warning); }

        .subtitle {
          color: var(--text-secondary);
          margin-top: 4px;
          font-size: 0.85rem;
        }

        .role-segmented-switcher {
          display: flex;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 4px;
          gap: 4px;
        }

        .segmented-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .segmented-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
        }

        .segmented-btn.active {
          color: var(--text-primary);
          background-color: var(--bg-active);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .context-selector-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 18px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .context-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .profile-select {
          max-width: 450px;
          font-weight: 500;
        }

        .profile-banner-card {
          padding: 20px 24px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .profile-main-info {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .profile-avatar {
          width: 54px;
          height: 54px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
        }

        .profile-avatar.faculty-avatar {
          background-color: var(--success-bg);
          color: var(--success);
        }

        .profile-avatar.student-avatar {
          background-color: var(--warning-bg);
          color: var(--warning);
        }

        .profile-main-info h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .profile-title {
          font-size: 0.825rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .profile-details-pills {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .profile-details-pills span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 110px;
          padding: 16px;
          cursor: pointer;
        }

        .stat-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-title {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          margin-top: 2px;
          letter-spacing: -0.01em;
        }

        .stat-icon {
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 10px;
          margin-top: 12px;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .admin-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 20px;
          flex-wrap: wrap;
        }

        .actions-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .actions-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
        }

        .layout-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .card-header h2 {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .day-picker {
          display: flex;
          gap: 4px;
          background-color: var(--bg-app);
          padding: 3px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .day-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 3px;
          cursor: pointer;
        }

        .day-btn.active {
          background-color: var(--bg-card);
          color: var(--text-primary);
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-item {
          display: flex;
          gap: 12px;
          border-left: 1px solid var(--border-color);
          padding-left: 12px;
          position: relative;
        }

        .timeline-item::after {
          content: '';
          position: absolute;
          left: -3px;
          top: 7px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: var(--text-secondary);
        }

        .timeline-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--text-muted);
          min-width: 110px;
        }

        .timeline-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          flex: 1;
          background-color: var(--bg-card-hover);
        }

        .class-info h3 {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .instructor-label {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .class-meta-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .room-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          background-color: var(--bg-app);
          padding: 3px 6px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 14px;
          background-color: var(--bg-card-hover);
        }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .metric-num {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 2px 0;
        }

        .metric-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 4px;
          background-color: var(--border-color);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--text-secondary);
          border-radius: 2px;
        }

        .popularity-list, .room-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .popularity-item, .room-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .popularity-item:last-child, .room-item:last-child {
          border-bottom: none;
        }

        .item-details, .room-details {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .course-code-tag {
          background-color: var(--bg-card-hover);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 3px 6px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .course-name-text h4, .room-details h4 {
          font-size: 0.825rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .course-name-text span, .room-details span {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .room-icon {
          color: var(--text-muted);
        }

        /* Faculty specific styles */
        .faculty-courses-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faculty-course-box {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 14px;
          background-color: var(--bg-card-hover);
        }

        .course-box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .course-title-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .course-box-meta {
          display: flex;
          gap: 6px;
        }

        .roster-preview-table {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
        }

        .roster-table-header {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1fr;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
        }

        .roster-table-row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1fr;
          align-items: center;
          font-size: 0.78rem;
          padding: 4px 0;
        }

        .student-name {
          color: var(--text-primary);
          font-weight: 500;
        }

        .student-group {
          color: var(--text-secondary);
        }

        .faculty-tools, .student-tools {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tool-btn {
          width: 100%;
          justify-content: flex-start;
        }

        /* Student specific styles */
        .student-courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }

        .student-course-card {
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .course-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .student-course-card h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .course-desc-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 8px;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .instructor-mini {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
        }

        .credits-tag {
          font-weight: 600;
          color: var(--text-primary);
        }

        .empty-state {
          text-align: center;
          padding: 20px;
          color: var(--text-muted);
          font-size: 0.78rem;
        }
      `}</style>
    </div>
  );
};

