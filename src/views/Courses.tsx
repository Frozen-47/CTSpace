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
    <div className="courses-view animate-fade-in">
      <header className="view-header">
        <div>
          <h1>Curriculum</h1>
          <p className="subtitle">Course catalog listings and syllabus details.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddCourse}>
          <Plus size={16} />
          New Course
        </button>
      </header>

      <section className="search-filter-bar card">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-wrapper">
          <select
            className="form-select filter-select"
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

      <section className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card card">
              <div className="course-card-header">
                <span className="course-code">{course.code}</span>
                <span className="badge badge-info">
                  {course.credits} Credits
                </span>
              </div>
              <h3 className="course-title">{course.name}</h3>
              <p className="course-description">{course.description}</p>
              
              <div className="course-actions">
                <button 
                  className="btn btn-secondary action-btn" 
                  onClick={() => onEditCourse(course)}
                >
                  <Edit size={12} />
                  Edit
                </button>
                <button 
                  className="btn btn-danger action-btn" 
                  onClick={() => onDeleteCourse(course.id)}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-catalog card">
            <BookOpen size={36} className="empty-icon" />
            <h3>No courses found</h3>
            <p>Try refining your search terms or filters.</p>
          </div>
        )}
      </section>

      <style>{`
        .courses-view {
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

        .search-filter-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
        }

        @media (max-width: 600px) {
          .search-filter-bar {
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

        .filter-select {
          min-width: 150px;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .course-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 18px;
        }

        .course-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .course-code {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .course-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .course-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 20px;
          flex: 1;
        }

        .course-actions {
          display: flex;
          gap: 8px;
          border-top: 1px solid var(--border-color);
          padding-top: 14px;
        }

        .action-btn {
          flex: 1;
          justify-content: center;
          padding: 6px 10px;
          font-size: 0.8rem;
        }

        .empty-catalog {
          grid-column: 1 / -1;
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

        .empty-catalog h3 {
          font-size: 0.9rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .empty-catalog p {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};
