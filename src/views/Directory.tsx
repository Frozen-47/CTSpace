import React, { useState } from 'react';
import { Search, Plus, User, Mail, BookOpen, Trash2, Edit, Award, MapPin, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import type { Course, Instructor, Student, ClassInstance, Enrollment } from '../mock/mockData';

interface DirectoryProps {
  instructors: Instructor[];
  students: Student[];
  classes: ClassInstance[];
  courses: Course[];
  enrollments: Enrollment[];
  onAddInstructor: () => void;
  onEditInstructor: (instructor: Instructor) => void;
  onDeleteInstructor: (id: string) => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddEnrollment: (studentId: string) => void;
  onDeleteEnrollment: (id: string) => void;
}

export const Directory: React.FC<DirectoryProps> = ({
  instructors,
  students,
  classes,
  courses,
  enrollments,
  onAddInstructor,
  onEditInstructor,
  onDeleteInstructor,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onAddEnrollment,
  onDeleteEnrollment
}) => {
  const [activeTab, setActiveTab] = useState<'faculty' | 'students'>('faculty');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const toggleStudentExpand = (studentId: string) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const getStudentEnrollments = (studentId: string) => {
    return enrollments.filter(e => e.studentId === studentId).map(e => {
      const cls = classes.find(c => c.id === e.classId);
      const course = cls ? courses.find(co => co.id === cls.courseId) : null;
      return {
        enrollmentId: e.id,
        grade: e.grade,
        room: cls?.room || 'Unknown',
        time: cls?.scheduleTime || 'TBD',
        days: cls?.scheduleDays.join('/') || 'TBD',
        code: course?.code || 'CS-???',
        name: course?.name || 'Unknown Course'
      };
    });
  };

  const getInstructorClasses = (instructorId: string) => {
    return classes.filter(c => c.instructorId === instructorId).map(c => {
      const course = courses.find(co => co.id === c.courseId);
      return {
        id: c.id,
        room: c.room,
        time: c.scheduleTime,
        days: c.scheduleDays.join('/'),
        code: course?.code || 'CS-???',
        name: course?.name || 'Unknown Course'
      };
    });
  };

  const filteredFaculty = instructors.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.office.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="directory-view animate-fade-in">
      <header className="view-header">
        <div>
          <h1>Directory</h1>
          <p className="subtitle">Department profiles, faculty offices, and academic records.</p>
        </div>
        <div>
          {activeTab === 'faculty' ? (
            <button className="btn btn-primary" onClick={onAddInstructor}>
              <Plus size={16} />
              Add Faculty
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onAddStudent}>
              <Plus size={16} />
              Add Student
            </button>
          )}
        </div>
      </header>

      <section className="directory-controls card">
        <div className="directory-tabs">
          <button 
            className={`directory-tab ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => { setActiveTab('faculty'); setSearchTerm(''); }}
          >
            Faculty & Staff ({instructors.length})
          </button>
          <button 
            className={`directory-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); setSearchTerm(''); }}
          >
            Students ({students.length})
          </button>
        </div>

        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder={activeTab === 'faculty' ? "Search faculty..." : "Search students..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="roster-container">
        {activeTab === 'faculty' ? (
          <div className="faculty-grid">
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map(inst => {
                const taughtClasses = getInstructorClasses(inst.id);
                return (
                  <div key={inst.id} className="faculty-card card">
                    <div className="faculty-info-header">
                      <div className="avatar-placeholder">
                        <User size={18} />
                      </div>
                      <div>
                        <h3>{inst.name}</h3>
                        <span className="badge badge-info">{inst.title}</span>
                      </div>
                    </div>

                    <div className="faculty-contact-details">
                      <div className="contact-item">
                        <Mail size={12} />
                        <a href={`mailto:${inst.email}`}>{inst.email}</a>
                      </div>
                      <div className="contact-item">
                        <MapPin size={12} />
                        <span>Office: {inst.office || 'TBD'}</span>
                      </div>
                      <div className="contact-item">
                        <Award size={12} />
                        <span>Research: {inst.specialization}</span>
                      </div>
                    </div>

                    <div className="taught-classes-section">
                      <h4>Assigned Courses ({taughtClasses.length})</h4>
                      {taughtClasses.length > 0 ? (
                        <div className="taught-classes-list">
                          {taughtClasses.map(c => (
                            <div key={c.id} className="taught-class-badge">
                              <strong>{c.code}</strong>: Room {c.room} ({c.days} {c.time})
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-classes-text">No active courses.</span>
                      )}
                    </div>

                    <div className="roster-actions">
                      <button className="btn btn-secondary action-btn" onClick={() => onEditInstructor(inst)}>
                        <Edit size={12} />
                        Edit
                      </button>
                      <button className="btn btn-danger action-btn" onClick={() => onDeleteInstructor(inst.id)}>
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-roster card">
                <p>No faculty records match your criteria.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="students-list-wrapper">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const isExpanded = expandedStudentId === student.id;
                const studentEnrollments = getStudentEnrollments(student.id);
                return (
                  <div key={student.id} className="student-row-wrapper card">
                    <div className="student-main-row" onClick={() => toggleStudentExpand(student.id)}>
                      <div className="student-profile-summary">
                        <div className="student-avatar">
                          <GraduationCap size={16} />
                        </div>
                        <div className="student-meta">
                          <h3>{student.name}</h3>
                          <span className="student-email">{student.email}</span>
                        </div>
                      </div>

                      <div className="student-academic-info">
                        <div className="academic-tag">
                          <span>{student.major}</span>
                        </div>
                        <div className="academic-tag">
                          <span>{student.year}</span>
                        </div>
                      </div>

                      <div className="student-row-interactions">
                        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEditStudent(student); }} title="Edit">
                          <Edit size={12} />
                        </button>
                        <button className="icon-btn danger" onClick={(e) => { e.stopPropagation(); onDeleteStudent(student.id); }} title="Delete">
                          <Trash2 size={12} />
                        </button>
                        <div className="expand-indicator">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="student-expanded-panel animate-fade-in">
                        <div className="expanded-panel-header">
                          <h4>Course Registrations</h4>
                          <button className="btn btn-secondary btn-sm" onClick={() => onAddEnrollment(student.id)}>
                            <Plus size={12} />
                            Register Class
                          </button>
                        </div>

                        {studentEnrollments.length > 0 ? (
                          <div className="enrollments-table-wrapper">
                            <table className="enrollments-table">
                              <thead>
                                <tr>
                                  <th>Course</th>
                                  <th>Schedule</th>
                                  <th>Room</th>
                                  <th>Grade</th>
                                  <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {studentEnrollments.map(enr => (
                                  <tr key={enr.enrollmentId}>
                                    <td>
                                      <strong>{enr.code}</strong>: {enr.name}
                                    </td>
                                    <td>{enr.days} ({enr.time})</td>
                                    <td>{enr.room}</td>
                                    <td>
                                      <span className={`badge ${enr.grade === 'IP' ? 'badge-warning' : 'badge-success'}`}>
                                        {enr.grade === 'IP' ? 'In Progress' : enr.grade}
                                      </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <button 
                                        className="btn-link-danger" 
                                        onClick={() => onDeleteEnrollment(enr.enrollmentId)}
                                      >
                                        Drop
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="empty-enrollments">
                            <BookOpen size={18} />
                            <p>No active registrations.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-roster card">
                <p>No student records match your criteria.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <style>{`
        .directory-view {
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

        .directory-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
        }

        @media (max-width: 768px) {
          .directory-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .directory-tabs {
          display: flex;
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 3px;
        }

        .directory-tab {
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .directory-tab.active {
          background-color: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          max-width: 320px;
        }

        @media (max-width: 768px) {
          .search-input-wrapper {
            max-width: none;
          }
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

        .faculty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .faculty-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 18px;
        }

        .faculty-info-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar-placeholder {
          width: 36px;
          height: 36px;
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faculty-info-header h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .faculty-contact-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 10px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .contact-item a {
          color: var(--text-primary);
          text-decoration: none;
        }

        .contact-item a:hover {
          text-decoration: underline;
        }

        .taught-classes-section h4 {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .taught-classes-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .taught-class-badge {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .no-classes-text {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .students-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .student-row-wrapper {
          padding: 0;
          overflow: hidden;
        }

        .student-main-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .student-main-row:hover {
          background-color: var(--bg-card-hover);
        }

        .student-profile-summary {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 220px;
        }

        .student-avatar {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-meta h3 {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .student-email {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .student-academic-info {
          display: flex;
          gap: 12px;
        }

        .academic-tag {
          font-size: 0.75rem;
          color: var(--text-secondary);
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }

        .student-row-interactions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .expand-indicator {
          color: var(--text-muted);
          margin-left: 4px;
        }

        .student-expanded-panel {
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-card-hover);
          padding: 16px 20px;
        }

        .expanded-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .expanded-panel-header h4 {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 0.75rem;
        }

        .enrollments-table-wrapper {
          overflow-x: auto;
        }

        .enrollments-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .enrollments-table th {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          padding: 6px 8px;
          border-bottom: 1px solid var(--border-color);
        }

        .enrollments-table td {
          font-size: 0.78rem;
          padding: 8px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .enrollments-table tr:last-child td {
          border-bottom: none;
        }

        .btn-link-danger {
          background: transparent;
          border: none;
          color: var(--danger);
          font-weight: 500;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .btn-link-danger:hover {
          text-decoration: underline;
        }

        .empty-enrollments {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: var(--text-muted);
          font-size: 0.75rem;
          gap: 6px;
        }

        .empty-roster {
          text-align: center;
          padding: 32px;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .roster-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }
      `}</style>
    </div>
  );
};
