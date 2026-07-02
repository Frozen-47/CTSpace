import React, { useState } from 'react';
import { Plus, Calendar, Search, MapPin, User, Users, Trash2, Edit } from 'lucide-react';
import type { Course, Instructor, ClassInstance, Enrollment } from '../mock/mockData';

interface ScheduleProps {
  classes: ClassInstance[];
  courses: Course[];
  instructors: Instructor[];
  enrollments: Enrollment[];
  onAddClass: () => void;
  onEditClass: (cls: ClassInstance) => void;
  onDeleteClass: (id: string) => void;
}

export const Schedule: React.FC<ScheduleProps> = ({
  classes,
  courses,
  instructors,
  enrollments,
  onAddClass,
  onEditClass,
  onDeleteClass
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('Fall 2026');

  const getEnrollmentCount = (classId: string) => {
    return enrollments.filter(e => e.classId === classId).length;
  };

  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const getInstructor = (instructorId: string) => {
    return instructors.find(i => i.id === instructorId);
  };

  const terms = Array.from(new Set(classes.map(c => c.term)));
  if (!terms.includes('Fall 2026')) terms.push('Fall 2026');

  const filteredClasses = classes.filter(cls => {
    const course = getCourse(cls.courseId);
    const instructor = getInstructor(cls.instructorId);
    const matchesSearch = 
      (course?.code.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (course?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (instructor?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      cls.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDay = dayFilter === 'all' || cls.scheduleDays.includes(dayFilter);
    const matchesTerm = cls.term === termFilter;

    return matchesSearch && matchesDay && matchesTerm;
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="schedule-view animate-fade-in">
      <header className="view-header">
        <div>
          <h1>Schedule</h1>
          <p className="subtitle">Course timetable allocations, faculty duties, and classroom bookings.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddClass}>
          <Plus size={16} />
          Add Schedule
        </button>
      </header>

      <section className="scheduler-controls card">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by course, instructor, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-grid">
          <select
            className="form-select"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
          >
            <option value="all">All Days</option>
            {daysOfWeek.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
          >
            {terms.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="classes-list">
        {filteredClasses.length > 0 ? (
          <div className="schedule-grid">
            {filteredClasses.map(cls => {
              const course = getCourse(cls.courseId);
              const inst = getInstructor(cls.instructorId);
              const enrolled = getEnrollmentCount(cls.id);
              const percentFull = Math.min(Math.round((enrolled / cls.capacity) * 100), 100);

              return (
                <div key={cls.id} className="class-schedule-card card">
                  <div className="class-schedule-header">
                    <div className="course-identifier">
                      <span className="code-badge">{course?.code || 'CS-???'}</span>
                      <span className="term-badge">{cls.term}</span>
                    </div>
                    <div className="schedule-actions">
                      <button className="icon-btn" onClick={() => onEditClass(cls)} title="Edit">
                        <Edit size={12} />
                      </button>
                      <button className="icon-btn danger" onClick={() => onDeleteClass(cls.id)} title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <h3 className="course-name">{course?.name || 'Unknown Course'}</h3>

                  <div className="schedule-meta-list">
                    <div className="meta-item">
                      <User size={12} className="meta-icon" />
                      <span>{inst?.title || 'Instructor'}: <strong>{inst?.name || 'Unassigned'}</strong></span>
                    </div>
                    <div className="meta-item">
                      <MapPin size={12} className="meta-icon" />
                      <span>Room: {cls.room}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={12} className="meta-icon" />
                      <span>{cls.scheduleDays.join(', ')} ({cls.scheduleTime})</span>
                    </div>
                  </div>

                  <div className="enrollment-status">
                    <div className="enrollment-labels">
                      <div className="enrollment-count-desc">
                        <Users size={12} />
                        <span>Enrolled: {enrolled} / {cls.capacity}</span>
                      </div>
                      <span className="percent-label">{percentFull}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${percentFull >= 90 ? 'full' : ''}`} 
                        style={{ width: `${percentFull}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-schedule card">
            <Calendar size={36} className="empty-icon" />
            <h3>No scheduled classes</h3>
            <p>Adjust your search filters or schedule a class above.</p>
          </div>
        )}
      </section>

      <style>{`
        .schedule-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .view-header h1 {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .scheduler-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
        }

        @media (max-width: 600px) {
          .scheduler-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 36px;
        }

        .filters-grid {
          display: flex;
          gap: 10px;
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .class-schedule-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 18px;
        }

        .class-schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .course-identifier {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .code-badge {
          background-color: var(--bg-card-hover);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 3px 6px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .term-badge {
          font-size: 0.72rem;
          color: var(--text-secondary);
          border: 1px solid transparent;
        }

        .schedule-actions {
          display: flex;
          gap: 4px;
        }

        .icon-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
          border-color: var(--border-color-hover);
        }

        .icon-btn.danger:hover {
          color: white;
          background-color: var(--danger);
          border-color: var(--danger);
        }

        .course-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .schedule-meta-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .meta-icon {
          color: var(--text-muted);
        }

        .enrollment-status {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .enrollment-labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
        }

        .enrollment-count-desc {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
        }

        .percent-label {
          color: var(--text-muted);
          font-weight: 500;
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

        .progress-fill.full {
          background-color: var(--danger);
        }

        .empty-schedule {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .empty-schedule h3 {
          font-size: 0.9rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .empty-schedule p {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};
