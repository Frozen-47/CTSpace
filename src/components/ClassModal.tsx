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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

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

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, type, initialData, courses, instructors, students, classes, onClose]);

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
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <h2 className="font-bold text-lg text-[var(--text-primary)]">{titlePrefix} {displayNames[type]}</h2>
          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] p-1.5 rounded-md transition cursor-pointer" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border-l-4 border-rose-500 p-3.5 mx-6 mt-4 rounded text-sm text-[var(--text-primary)]">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* COURSE FORM */}
          {type === 'course' && (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Course Code</label>
                  <input
                    type="text"
                    name="code"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., CS-101"
                    value={formData.code || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Credits</label>
                  <input
                    type="number"
                    name="credits"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    min="1"
                    max="6"
                    value={formData.credits || 3}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Course Title</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  placeholder="e.g., Data Structures and Algorithms"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Course Description</label>
                <textarea
                  name="description"
                  className="w-full min-h-[90px] resize-y px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  placeholder="Detailed course overview and learning objectives..."
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* INSTRUCTOR FORM */}
          {type === 'instructor' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  placeholder="e.g., Dr. Evelyn Wright"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  placeholder="e.g., e.wright@university.edu"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Academic Title</label>
                  <select
                    name="title"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
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
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Office Location</label>
                  <input
                    type="text"
                    name="office"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., Tech Hall 402"
                    value={formData.office || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Area of Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
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
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Select Course</label>
                <select
                  name="courseId"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  value={formData.courseId || ''}
                  onChange={handleInputChange}
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Assign Instructor</label>
                <select
                  name="instructorId"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  value={formData.instructorId || ''}
                  onChange={handleInputChange}
                  required
                >
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>{i.title} {i.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Room / Classroom</label>
                  <input
                    type="text"
                    name="room"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., Tech Hall 101"
                    value={formData.room || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Class Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    min="5"
                    max="200"
                    value={formData.capacity || 30}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Academic Term</label>
                  <input
                    type="text"
                    name="term"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., Fall 2026"
                    value={formData.term || 'Fall 2026'}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Time Slot</label>
                  <select
                    name="scheduleTime"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    value={formData.scheduleTime || timeslots[0]}
                    onChange={handleInputChange}
                  >
                    {timeslots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Class Group (Cohort)</label>
                <select
                  name="classGroup"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  value={formData.classGroup || CLASS_GROUPS[0]}
                  onChange={handleInputChange}
                  required
                >
                  {CLASS_GROUPS.map(cg => (
                    <option key={cg} value={cg}>{cg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Days of Week</label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {daysOfWeek.map(day => {
                    const isChecked = (formData.scheduleDays || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`p-2 rounded-md border text-xs font-bold transition cursor-pointer ${
                          isChecked 
                            ? 'bg-[var(--text-primary)] text-[var(--bg-app)] border-[var(--text-primary)] shadow-sm' 
                            : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color-hover)]'
                        }`}
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
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., Akash V"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Roll Number</label>
                  <input
                    type="text"
                    name="rollNo"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., 22CT24038"
                    value={formData.rollNo || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., akash.v@student.edu"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., 9629346096"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">GitHub URL</label>
                  <input
                    type="text"
                    name="github"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., https://github.com/username"
                    value={formData.github || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">LinkedIn URL</label>
                  <input
                    type="text"
                    name="linkedin"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., https://linkedin.com/in/username"
                    value={formData.linkedin || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Class Group (Cohort)</label>
                  <select
                    name="classGroup"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    value={formData.classGroup || CLASS_GROUPS[0]}
                    onChange={handleInputChange}
                    required
                  >
                    {CLASS_GROUPS.map(cg => (
                      <option key={cg} value={cg}>{cg}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Blood Group</label>
                  <input
                    type="text"
                    name="bloodGroup"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., B+VE"
                    value={formData.bloodGroup || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Medium</label>
                  <select
                    name="medium"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    value={formData.medium || 'English'}
                    onChange={handleInputChange}
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Date of Birth</label>
                  <input
                    type="text"
                    name="dob"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., 12.11.2007"
                    value={formData.dob || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Subject Group</label>
                <input
                  type="text"
                  name="group"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  placeholder="e.g., maths, computer science"
                  value={formData.group || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">10th Mark (%)</label>
                  <input
                    type="text"
                    name="mark10"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., 59%"
                    value={formData.mark10 || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">11th Mark (%)</label>
                  <input
                    type="text"
                    name="mark11"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., 64%"
                    value={formData.mark11 || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">12th Mark (%)</label>
                  <input
                    type="text"
                    name="mark12"
                    className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                    placeholder="e.g., 72%"
                    value={formData.mark12 || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Fee Payment Section */}
              <div className="p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)] flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                  <span>Fee Payment Status</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    (formData.feeStatus || 'Paid') === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : (formData.feeStatus || 'Paid') === 'Partial'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {formData.feeStatus || 'Paid'}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Status</label>
                    <select
                      name="feeStatus"
                      className="w-full px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs outline-none"
                      value={formData.feeStatus || 'Paid'}
                      onChange={handleInputChange}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Total Fee (₹)</label>
                    <input
                      type="number"
                      name="totalFee"
                      className="w-full px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs outline-none"
                      value={formData.totalFee ?? 45000}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Paid Amount (₹)</label>
                    <input
                      type="number"
                      name="paidAmount"
                      className="w-full px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs outline-none"
                      value={formData.paidAmount ?? 45000}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ENROLLMENT FORM */}
          {type === 'enrollment' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Student</label>
                <select
                  name="studentId"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  value={formData.studentId || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!initialData}
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.classGroup})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Class</label>
                <select
                  name="classId"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
                  value={formData.classId || ''}
                  onChange={handleInputChange}
                  required
                >
                  {classes.map(cls => {
                    const course = courses.find(c => c.id === cls.courseId);
                    return (
                      <option key={cls.id} value={cls.id}>
                        {course?.code || 'CS-???'} - Room {cls.room} ({cls.scheduleDays.join('/')}) [{cls.classGroup}]
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Grade</label>
                <select
                  name="grade"
                  className="w-full px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition"
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

          <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-[var(--border-color)]">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color-hover)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[var(--text-primary)] hover:bg-[var(--primary-hover)] text-[var(--bg-app)] text-xs font-semibold transition cursor-pointer flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Details'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
