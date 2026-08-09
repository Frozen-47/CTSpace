import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ClassModal } from './components/ClassModal';
import { ProtectionGuard } from './components/ProtectionGuard';
import { Dashboard } from './views/Dashboard';
import { Courses } from './views/Courses';
import { Schedule } from './views/Schedule';
import { Directory } from './views/Directory';
import { AdminPanel } from './views/AdminPanel';
import { db } from './services/db';
import { SUPABASE_CONFIG } from './config/supabase';
import type { Course, Instructor, ClassInstance, Student, Enrollment } from './mock/mockData';

function App() {
  // Protection Layer State (Hard locked for live build phase)
  const [isProtected] = useState<boolean>(true);

  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [useSupabase, setUseSupabase] = useState<boolean>(SUPABASE_CONFIG.getUseSupabase());

  // Database Arrays State
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassInstance[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Role-Wise Dashboard State
  const [currentRole, setCurrentRole] = useState<'admin' | 'faculty' | 'student'>('admin');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // UI Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'course' | 'instructor' | 'class' | 'student' | 'enrollment'>('course');
  const [editingRecord, setEditingRecord] = useState<any>(null);

  // Status/Toast Message State
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync theme with HTML body
  useEffect(() => {
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
  }, [theme]);

  // Load database items on mount or when DB engine is toggled
  const fetchAllData = async () => {
    try {
      const [fetchedCourses, fetchedClasses, fetchedInstructors, fetchedStudents, fetchedEnrollments] = await Promise.all([
        db.getCourses(),
        db.getClasses(),
        db.getInstructors(),
        db.getStudents(),
        db.getEnrollments(),
      ]);

      setCourses(fetchedCourses);
      setClasses(fetchedClasses);
      setInstructors(fetchedInstructors);
      setStudents(fetchedStudents);
      setEnrollments(fetchedEnrollments);

      if (fetchedInstructors.length > 0 && !selectedInstructorId) {
        setSelectedInstructorId(fetchedInstructors[0].id);
      }
      if (fetchedStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(fetchedStudents[0].id);
      }
    } catch (err: any) {
      showToast('error', `Failed to load database: ${err.message || err}`);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [useSupabase]);

  // Helper to show temporary toasts
  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Toggle dynamic DB mode selection
  const handleToggleSupabase = (val: boolean) => {
    SUPABASE_CONFIG.setUseSupabase(val);
    setUseSupabase(val);
    showToast('success', `Switched database connection engine to ${val ? 'Supabase' : 'Local Storage Mock'}.`);
  };

  // Reset database back to default mock seeds
  const handleResetDatabase = async () => {
    try {
      await db.resetDatabase();
      await fetchAllData();
      showToast('success', 'Local storage mock database has been reset to defaults.');
    } catch (err: any) {
      showToast('error', `Reset failed: ${err.message}`);
    }
  };

  // Trigger modal for creation
  const handleAddClick = (type: typeof modalType, preFilledData?: any) => {
    setModalType(type);
    setEditingRecord(preFilledData || null);
    setIsModalOpen(true);
  };

  // Trigger modal for editing
  const handleEditClick = (type: typeof modalType, record: any) => {
    setModalType(type);
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  // Delete handlers
  const handleDelete = async (type: typeof modalType, id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? Related scheduled classes or enrollments may also be removed.`)) {
      return;
    }

    try {
      if (type === 'course') {
        await db.deleteCourse(id);
      } else if (type === 'instructor') {
        await db.deleteInstructor(id);
      } else if (type === 'class') {
        await db.deleteClass(id);
      } else if (type === 'student') {
        await db.deleteStudent(id);
      } else if (type === 'enrollment') {
        await db.deleteEnrollment(id);
      }

      showToast('success', `Deleted ${type} successfully.`);
      await fetchAllData();
    } catch (err: any) {
      showToast('error', `Deletion failed: ${err.message}`);
    }
  };

  // Save changes from Modal
  const handleSaveRecord = async (formData: any) => {
    try {
      if (modalType === 'course') {
        await db.saveCourse(formData);
      } else if (modalType === 'instructor') {
        await db.saveInstructor(formData);
      } else if (modalType === 'class') {
        await db.saveClass(formData);
      } else if (modalType === 'student') {
        await db.saveStudent(formData);
      } else if (modalType === 'enrollment') {
        await db.saveEnrollment(formData);
      }

      showToast('success', `Successfully saved ${modalType} details.`);
      await fetchAllData();
    } catch (err: any) {
      // Propagate error back to modal handler
      throw err;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Strict Protection Screen for Active Build Phase */}
      <ProtectionGuard isProtected={isProtected} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          useSupabase={useSupabase}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
        />

      {/* Main View Area */}
      <main className="flex-1 p-6 md:p-10 max-w-[1300px] mx-auto w-full overflow-y-auto h-screen">
        {activeTab === 'dashboard' && (
          <Dashboard
            courses={courses}
            classes={classes}
            instructors={instructors}
            students={students}
            enrollments={enrollments}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            selectedInstructorId={selectedInstructorId}
            setSelectedInstructorId={setSelectedInstructorId}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
            onAddCourse={() => handleAddClick('course')}
            onAddClass={() => handleAddClick('class')}
            onAddStudent={() => handleAddClick('student')}
            onAddInstructor={() => handleAddClick('instructor')}
          />
        )}

        {activeTab === 'courses' && (
          <Courses
            courses={courses}
            onAddCourse={() => handleAddClick('course')}
            onEditCourse={(course) => handleEditClick('course', course)}
            onDeleteCourse={(id) => handleDelete('course', id)}
          />
        )}

        {activeTab === 'schedule' && (
          <Schedule
            classes={classes}
            courses={courses}
            instructors={instructors}
            enrollments={enrollments}
            onAddClass={() => handleAddClick('class')}
            onEditClass={(cls) => handleEditClick('class', cls)}
            onDeleteClass={(id) => handleDelete('class', id)}
          />
        )}

        {activeTab === 'directory' && (
          <Directory
            instructors={instructors}
            students={students}
            classes={classes}
            courses={courses}
            enrollments={enrollments}
            onAddInstructor={() => handleAddClick('instructor')}
            onEditInstructor={(inst) => handleEditClick('instructor', inst)}
            onDeleteInstructor={(id) => handleDelete('instructor', id)}
            onAddStudent={() => handleAddClick('student')}
            onEditStudent={(stud) => handleEditClick('student', stud)}
            onDeleteStudent={(id) => handleDelete('student', id)}
            onAddEnrollment={(studentId) => handleAddClick('enrollment', { studentId, grade: 'IP' })}
            onDeleteEnrollment={(id) => handleDelete('enrollment', id)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            useSupabase={useSupabase}
            onToggleSupabase={handleToggleSupabase}
            onResetDatabase={handleResetDatabase}
            onRefreshData={fetchAllData}
            statusMessage={statusMessage}
          />
        )}
      </main>

      {/* Shared CRUD Edit/Create Modal */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        initialData={editingRecord}
        onSave={handleSaveRecord}
        courses={courses}
        instructors={instructors}
        students={students}
        classes={classes}
      />

      {/* Global Status Notice (Toasts) */}
      {statusMessage && activeTab !== 'admin' && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
        }`}>
          <span>{statusMessage.text}</span>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
