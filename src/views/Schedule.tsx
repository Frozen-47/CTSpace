import React, { useState } from 'react';
import { Plus, Calendar, Search, MapPin, User, Users, Trash2, Edit } from 'lucide-react';
import { CLASS_GROUPS, type Course, type Instructor, type ClassInstance, type Enrollment } from '../mock/mockData';

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
  const [classGroupFilter, setClassGroupFilter] = useState('all');

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
    const matchesClassGroup = classGroupFilter === 'all' || cls.classGroup === classGroupFilter;

    return matchesSearch && matchesDay && matchesTerm && matchesClassGroup;
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Schedule</h1>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
            Course timetable allocations ({filteredClasses.length} sessions active in {termFilter})
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--text-primary)] hover:bg-[var(--primary-hover)] text-[var(--bg-app)] text-xs font-semibold transition cursor-pointer shadow-sm" onClick={onAddClass}>
          <Plus size={15} />
          Add Schedule
        </button>
      </header>

      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            className="w-full pl-9 pr-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--text-secondary)] transition"
            placeholder="Search by course, instructor, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <select
            className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-medium outline-none focus:border-[var(--text-secondary)] transition"
            value={classGroupFilter}
            onChange={(e) => setClassGroupFilter(e.target.value)}
          >
            <option value="all">All Batches</option>
            {CLASS_GROUPS.map(cg => (
              <option key={cg} value={cg}>{cg}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-medium outline-none focus:border-[var(--text-secondary)] transition"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
          >
            <option value="all">All Days</option>
            {daysOfWeek.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-medium outline-none focus:border-[var(--text-secondary)] transition"
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
          >
            {terms.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map(cls => {
              const course = getCourse(cls.courseId);
              const inst = getInstructor(cls.instructorId);
              const enrolled = getEnrollmentCount(cls.id);
              const percentFull = Math.min(Math.round((enrolled / cls.capacity) * 100), 100);

              return (
                <div key={cls.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 flex flex-col justify-between transition shadow-sm gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-[var(--text-primary)]">{course?.code || 'CS-???'}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{cls.classGroup}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)]">{cls.term}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer" onClick={() => onEditClass(cls)} title="Edit">
                          <Edit size={13} />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-400 transition cursor-pointer" onClick={() => onDeleteClass(cls.id)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">{course?.name || 'Unknown Course'}</h3>

                    <div className="flex flex-col gap-2 text-xs text-[var(--text-secondary)] border-y border-[var(--border-color)] py-3">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-[var(--text-muted)]" />
                        <span>{inst?.title || 'Instructor'}: <strong className="text-[var(--text-primary)]">{inst?.name || 'Unassigned'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-[var(--text-muted)]" />
                        <span>Room: <strong>{cls.room}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-[var(--text-muted)]" />
                        <span>{cls.scheduleDays.join(', ')} ({cls.scheduleTime})</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1 text-[var(--text-muted)] font-medium">
                        <Users size={12} />
                        <span>Enrolled: {enrolled} / {cls.capacity}</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{percentFull}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${percentFull >= 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${percentFull}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Calendar size={36} className="text-[var(--text-muted)] mb-3" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No scheduled classes</h3>
            <p className="text-xs text-[var(--text-secondary)]">Adjust your search filters or schedule a class above.</p>
          </div>
        )}
      </section>
    </div>
  );
};
