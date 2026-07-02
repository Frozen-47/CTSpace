import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  ArrowUpRight,
  MapPin,
  Clock,
  UserCheck
} from 'lucide-react';
import type { Course, Instructor, Student, ClassInstance, Enrollment } from '../mock/mockData';

interface DashboardProps {
  courses: Course[];
  classes: ClassInstance[];
  instructors: Instructor[];
  students: Student[];
  enrollments: Enrollment[];
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  courses,
  classes,
  instructors,
  students,
  enrollments,
  setActiveTab
}) => {
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

  const sampleClasses = classes
    .filter(c => c.scheduleDays.includes('Monday'))
    .slice(0, 3);

  const classEnrollmentCounts: { [classId: string]: number } = {};
  enrollments.forEach(e => {
    classEnrollmentCounts[e.classId] = (classEnrollmentCounts[e.classId] || 0) + 1;
  });

  const popularClassesList = Object.entries(classEnrollmentCounts)
    .map(([classId, count]) => {
      const cls = classes.find(c => c.id === classId);
      const course = cls ? courses.find(co => co.id === cls.courseId) : null;
      return {
        id: classId,
        count,
        code: course?.code || 'CS-???',
        name: course?.name || 'Unknown Course',
        capacity: cls?.capacity || 30
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="dashboard-view animate-fade-in">
      <header className="view-header">
        <div>
          <h1>Overview</h1>
          <p className="subtitle">Department analytics, timetable tracking, and roster status.</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card card" onClick={() => setActiveTab('courses')}>
          <div className="stat-main">
            <div className="stat-info">
              <span className="stat-title">Courses Offered</span>
              <span className="stat-value">{totalCourses}</span>
            </div>
            <div className="stat-icon">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="stat-footer">
            <span>View curriculum catalog</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        <div className="stat-card card" onClick={() => setActiveTab('schedule')}>
          <div className="stat-main">
            <div className="stat-info">
              <span className="stat-title">Active Classes</span>
              <span className="stat-value">{activeClasses}</span>
            </div>
            <div className="stat-icon">
              <Calendar size={16} />
            </div>
          </div>
          <div className="stat-footer">
            <span>View timetable slots</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        <div className="stat-card card" onClick={() => setActiveTab('directory')}>
          <div className="stat-main">
            <div className="stat-info">
              <span className="stat-title">Faculty Roster</span>
              <span className="stat-value">{totalFaculty}</span>
            </div>
            <div className="stat-icon">
              <Users size={16} />
            </div>
          </div>
          <div className="stat-footer">
            <span>View staff profiles</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        <div className="stat-card card" onClick={() => setActiveTab('directory')}>
          <div className="stat-main">
            <div className="stat-info">
              <span className="stat-title">Active Students</span>
              <span className="stat-value">{totalStudents}</span>
            </div>
            <div className="stat-icon">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="stat-footer">
            <span>View student directory</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </section>

      <div className="dashboard-layout">
        <div className="layout-col main-col">
          <div className="card timetable-card">
            <div className="card-header">
              <h2>Today's Timetable</h2>
              <span className="badge badge-info">Monday Schedule</span>
            </div>
            
            <div className="timeline">
              {sampleClasses.length > 0 ? (
                sampleClasses.map(cls => {
                  const course = courses.find(c => c.id === cls.courseId);
                  const inst = instructors.find(i => i.id === cls.instructorId);
                  return (
                    <div key={cls.id} className="timeline-item">
                      <div className="timeline-time">
                        <Clock size={12} />
                        <span>{cls.scheduleTime.split(' - ')[0]}</span>
                      </div>
                      <div className="timeline-content">
                        <div className="class-info">
                          <h3>{course?.code}: {course?.name}</h3>
                          <span className="instructor-label">Instructor: {inst?.title} {inst?.name}</span>
                        </div>
                        <div className="room-label">
                          <MapPin size={12} />
                          <span>{cls.room}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>No classes scheduled for today.</p>
                </div>
              )}
            </div>
          </div>

          <div className="card metrics-card">
            <div className="card-header">
              <h2>Key Metrics</h2>
            </div>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Average Class Size</span>
                <span className="metric-num">{averageClassSize}</span>
                <span className="metric-subtitle">students enrolled per class</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((averageClassSize / 40) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="metric-box">
                <span className="metric-label">Total Course Seats</span>
                <span className="metric-num">{totalEnrollments}</span>
                <span className="metric-subtitle">registered enrollments</span>
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
              <h2>Enrollment Rates</h2>
            </div>
            <div className="popularity-list">
              {popularClassesList.length > 0 ? (
                popularClassesList.map(item => {
                  const percent = Math.round((item.count / item.capacity) * 100);
                  const isWarning = percent >= 90;
                  return (
                    <div key={item.id} className="popularity-item">
                      <div className="item-details">
                        <span className="course-code-tag">{item.code}</span>
                        <div className="course-name-text">
                          <h4>{item.name}</h4>
                          <span>{item.count} / {item.capacity} registered</span>
                        </div>
                      </div>
                      <span className={`badge ${isWarning ? 'badge-danger' : 'badge-info'}`}>
                        {percent}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>No enrollment records.</p>
                </div>
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
                        <span>Primary classroom</span>
                      </div>
                    </div>
                    <span className="badge badge-info">{count} {count === 1 ? 'class' : 'classes'}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No classes scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .view-header {
          margin-bottom: 8px;
        }

        .view-header h1 {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .subtitle {
          color: var(--text-secondary);
          margin-top: 4px;
          font-size: 0.875rem;
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
          cursor: pointer;
          min-height: 110px;
          padding: 16px;
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
          width: 32px;
          height: 32px;
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
          transition: color var(--transition-fast);
        }

        .stat-card:hover .stat-footer {
          color: var(--text-primary);
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
          min-width: 65px;
        }

        .timeline-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
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
          padding-bottom: 0;
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

        .empty-state {
          text-align: center;
          padding: 16px;
          color: var(--text-muted);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};
