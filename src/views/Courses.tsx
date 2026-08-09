import React, { useState } from 'react';
import { Search, Plus, BookOpen, Trash2, Edit } from 'lucide-react';
import type { Course } from '../mock/mockData';

interface CoursesProps {
  courses: Course[];
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

export const Courses: React.FC<CoursesProps> = ({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (levelFilter === 'all') return matchesSearch;
    
    const codeMatch = c.code.match(/\d+/);
    if (!codeMatch) return matchesSearch;
    const num = parseInt(codeMatch[0], 10);
    
    if (levelFilter === '100') return matchesSearch && num >= 100 && num < 200;
    if (levelFilter === '200') return matchesSearch && num >= 200 && num < 300;
    if (levelFilter === '300') return matchesSearch && num >= 300 && num < 400;
    if (levelFilter === '400') return matchesSearch && num >= 400;
    
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Curriculum</h1>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Course catalog listings and syllabus details.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--text-primary)] hover:bg-[var(--primary-hover)] text-[var(--bg-app)] text-xs font-semibold transition cursor-pointer shadow-sm" onClick={onAddCourse}>
          <Plus size={15} />
          New Course
        </button>
      </header>

      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            className="w-full pl-9 pr-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--text-secondary)] transition"
            placeholder="Search by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            className="w-full sm:w-48 px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-medium outline-none focus:border-[var(--text-secondary)] transition"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="100">100-Level (Intro)</option>
            <option value="200">200-Level (Intermediate)</option>
            <option value="300">300-Level (Advanced)</option>
            <option value="400">400-Level (Senior)</option>
          </select>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 flex flex-col justify-between transition shadow-sm gap-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">{course.code}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {course.credits} Credits
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">{course.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{course.description}</p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] mt-4">
                <button 
                  className="flex-1 py-1.5 px-3 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer" 
                  onClick={() => onEditCourse(course)}
                >
                  <Edit size={12} />
                  Edit
                </button>
                <button 
                  className="py-1.5 px-3 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer" 
                  onClick={() => onDeleteCourse(course.id)}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <BookOpen size={36} className="text-[var(--text-muted)] mb-3" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No courses found</h3>
            <p className="text-xs text-[var(--text-secondary)]">Try refining your search terms or filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};
