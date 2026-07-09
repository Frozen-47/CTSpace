import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { CLASS_GROUPS, type Course, type Instructor, type Student, type ClassInstance } from '../mock/mockData';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'course' | 'instructor' | 'class' | 'student' | 'enrollment';
  initialData?: any; // If editing, otherwise undefined for creation
  onSave: (formData: any) => Promise<void>;
  courses: Course[];
  instructors: Instructor[];
  students: Student[];
  classes: ClassInstance[];
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  type,
  initialData,
  onSave,
  courses,
  instructors,
  students,
  classes
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic state container
  const [formData, setFormData] = useState<any>({});

  // Reset/populate form state when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (initialData) {
      setFormData({ ...initialData });
    } else {
      // Default initial states based on type
      if (type === 'course') {
        setFormData({ code: '', name: '', description: '', credits: 3 });
      } else if (type === 'instructor') {
        setFormData({ name: '', email: '', office: '', title: 'Assistant Professor', specialization: '' });
      } else if (type === 'class') {
        setFormData({
          courseId: courses[0]?.id || '',
          instructorId: instructors[0]?.id || '',
          room: '',
          scheduleDays: [],
          scheduleTime: '09:00 AM - 10:30 AM',
          capacity: 30,
          term: 'Fall 2026',
          classGroup: CLASS_GROUPS[0]
        });
      } else if (type === 'student') {
        setFormData({ name: '', email: '', classGroup: CLASS_GROUPS[0] });
      } else if (type === 'enrollment') {
        setFormData({
          studentId: students[0]?.id || '',
          classId: classes[0]?.id || '',
          grade: 'IP'
        });
      }
    }
  }, [isOpen, type, initialData, courses, instructors, students, classes]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'credits' || name === 'capacity' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.scheduleDays || [];
    let nextDays = [];
    if (currentDays.includes(day)) {
      nextDays = currentDays.filter((d: string) => d !== day);
    } else {
      nextDays = [...currentDays, day];
    }
    setFormData((prev: any) => ({ ...prev, scheduleDays: nextDays }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Frontend validations
    if (type === 'course') {
      if (!formData.code || !formData.name) {
        setError('Course Code and Name are required.');
        setLoading(false);
        return;
      }
    } else if (type === 'instructor') {
      if (!formData.name || !formData.email) {
        setError('Instructor Name and Email are required.');
        setLoading(false);
        return;
      }
    } else if (type === 'class') {
      if (!formData.room || !formData.scheduleTime || !formData.term) {
        setError('Room, Time, and Term are required.');
        setLoading(false);
        return;
      }
      if (!formData.scheduleDays || formData.scheduleDays.length === 0) {
        setError('Please select at least one schedule day.');
        setLoading(false);
        return;
      }
    } else if (type === 'student') {
      if (!formData.name || !formData.email) {
        setError('Student Name and Email are required.');
        setLoading(false);
        return;
      }
    }

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const titlePrefix = initialData ? 'Edit' : 'Add New';
  const displayNames = {
    course: 'Course',
    instructor: 'Faculty Member',
    class: 'Class Schedule',
    student: 'Student',
    enrollment: 'Student Enrollment'
  };

  const timeslots = [
    '09:00 AM - 10:30 AM',
    '10:00 AM - 11:30 AM',
    '11:00 AM - 12:30 PM',
    '01:00 PM - 02:30 PM',
    '02:00 PM - 03:30 PM',
    '03:00 PM - 04:30 PM'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass animate-fade-in">
        <div className="modal-header">
          <h2>{titlePrefix} {displayNames[type]}</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* COURSE FORM */}
          {type === 'course' && (
            <>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    name="code"
                    className="form-input"
                    placeholder="e.g., CS-101"
                    value={formData.code || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    name="credits"
                    className="form-input"
                    min="1"
                    max="6"
                    value={formData.credits || 3}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Introduction to Computer Science"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Provide a brief course description..."
                  value={formData.description || ''}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          {/* INSTRUCTOR FORM */}
          {type === 'instructor' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Dr. Evelyn Wright"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="e.g., e.wright@university.edu"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Academic Title</label>
                  <select
                    name="title"
                    className="form-select"
                    value={formData.title || 'Assistant Professor'}
                    onChange={handleInputChange}
                  >
                    <option value="Professor & Department Chair">Professor & Dept Chair</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Adjunct Professor">Adjunct Professor</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Office Location</label>
                  <input
                    type="text"
                    name="office"
                    className="form-input"
                    placeholder="e.g., Tech Hall 402"
                    value={formData.office || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Area of Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  className="form-input"
                  placeholder="e.g., Artificial Intelligence & Computer Vision"
                  value={formData.specialization || ''}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          {/* CLASS FORM */}
          {type === 'class' && (
            <>
              <div className="form-group">
                <label className="form-label">Select Course</label>
                <select
                  name="courseId"
                  className="form-select"
                  value={formData.courseId || ''}
                  onChange={handleInputChange}
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Instructor</label>
                <select
                  name="instructorId"
                  className="form-select"
                  value={formData.instructorId || ''}
                  onChange={handleInputChange}
                  required
                >
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>{i.title} {i.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Room / Classroom</label>
                  <input
                    type="text"
                    name="room"
                    className="form-input"
                    placeholder="e.g., Tech Hall 101"
                    value={formData.room || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Class Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    className="form-input"
                    min="5"
                    max="100"
                    value={formData.capacity || 30}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Term</label>
                  <input
                    type="text"
                    name="term"
                    className="form-input"
                    placeholder="e.g., Fall 2026"
                    value={formData.term || 'Fall 2026'}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Time Slot</label>
                  <select
                    name="scheduleTime"
                    className="form-select"
                    value={formData.scheduleTime || '09:00 AM - 10:30 AM'}
                    onChange={handleInputChange}
                  >
                    {timeslots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Class Group (Cohort)</label>
                <select
                  name="classGroup"
                  className="form-select"
                  value={formData.classGroup || CLASS_GROUPS[0]}
                  onChange={handleInputChange}
                  required
                >
                  {CLASS_GROUPS.map(cg => (
                    <option key={cg} value={cg}>{cg}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Days of Week</label>
                <div className="days-checkbox-grid">
                  {daysOfWeek.map(day => {
                    const isChecked = (formData.scheduleDays || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`day-btn ${isChecked ? 'selected' : ''}`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* STUDENT FORM */}
          {type === 'student' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Alice Smith"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="e.g., a.smith@student.edu"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Class Group (Cohort)</label>
                <select
                  name="classGroup"
                  className="form-select"
                  value={formData.classGroup || CLASS_GROUPS[0]}
                  onChange={handleInputChange}
                  required
                >
                  {CLASS_GROUPS.map(cg => (
                    <option key={cg} value={cg}>{cg}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* ENROLLMENT FORM */}
          {type === 'enrollment' && (
            <>
              <div className="form-group">
                <label className="form-label">Student</label>
                <select
                  name="studentId"
                  className="form-select"
                  value={formData.studentId || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!initialData} // Lock student choice during edit
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.classGroup})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  name="classId"
                  className="form-select"
                  value={formData.classId || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!initialData} // Lock class choice during edit
                >
                  {classes.map(c => {
                    const course = courses.find(co => co.id === c.courseId);
                    return (
                      <option key={c.id} value={c.id}>
                        {course?.code || 'Class'} (Room {c.room}) - {c.scheduleTime}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Grade</label>
                <select
                  name="grade"
                  className="form-select"
                  value={formData.grade || 'IP'}
                  onChange={handleInputChange}
                >
                  <option value="IP">IP (In Progress)</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Details'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 580px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
        }

        .modal-error {
          background-color: var(--danger-bg);
          border-left: 4px solid var(--danger);
          padding: 12px 18px;
          margin: 16px 24px 0;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .modal-form {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .flex-1 {
          flex: 1;
        }

        .days-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .day-btn {
          padding: 10px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--bg-input);
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-display);
          transition: all var(--transition-fast);
        }

        .day-btn:hover {
          border-color: var(--border-color-hover);
          color: var(--text-primary);
        }

        .day-btn.selected {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: var(--shadow-accent);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
