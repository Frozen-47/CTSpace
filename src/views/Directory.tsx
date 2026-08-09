import React, { useState } from 'react';
import { Search, Plus, User, Mail, Trash2, Edit, Award, MapPin, GraduationCap, ChevronDown, ChevronUp, Phone, Calendar, Droplet, FileText, ExternalLink, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { CLASS_GROUPS, type Course, type Instructor, type Student, type ClassInstance, type Enrollment } from '../mock/mockData';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

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
  const [activeTab, setActiveTab] = useState<'faculty' | 'students'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [studentClassFilter, setStudentClassFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');

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

  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.bloodGroup && s.bloodGroup.toLowerCase().includes(q)) ||
      (s.group && s.group.toLowerCase().includes(q)) ||
      (s.medium && s.medium.toLowerCase().includes(q)) ||
      (s.github && s.github.toLowerCase().includes(q)) ||
      (s.linkedin && s.linkedin.toLowerCase().includes(q));
      
    const matchesClass = studentClassFilter === 'all' || s.classGroup === studentClassFilter;
    const matchesFee = feeStatusFilter === 'all' || (s.feeStatus || 'Paid') === feeStatusFilter;

    return matchesSearch && matchesClass && matchesFee;
  });

  return (
    <div className="flex flex-col animate-fade-in pb-12">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Student Directory & Academic Database</h1>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Student Profiles, 10th/11th/12th Marks, Fee Payment Status & Social Accounts.</p>
        </div>
        <div>
          {activeTab === 'faculty' ? (
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--text-primary)] hover:bg-[var(--primary-hover)] text-[var(--bg-app)] text-xs font-semibold transition cursor-pointer shadow-sm" onClick={onAddInstructor}>
              <Plus size={15} />
              Add Faculty
            </button>
          ) : (
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--text-primary)] hover:bg-[var(--primary-hover)] text-[var(--bg-app)] text-xs font-semibold transition cursor-pointer shadow-sm" onClick={onAddStudent}>
              <Plus size={15} />
              Add Student Record
            </button>
          )}
        </div>
      </header>

      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-1.5 bg-[var(--bg-card-hover)] p-1 rounded-lg border border-[var(--border-color)]">
          <button 
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'students' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => { setActiveTab('students'); setSearchTerm(''); }}
          >
            Students ({students.length})
          </button>
          <button 
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'faculty' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => { setActiveTab('faculty'); setSearchTerm(''); }}
          >
            Faculty & Staff ({instructors.length})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {activeTab === 'students' && (
            <>
              <select
                className="px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-medium outline-none focus:border-[var(--text-secondary)] transition"
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
              >
                <option value="all">All Batches</option>
                {CLASS_GROUPS.map(cg => (
                  <option key={cg} value={cg}>{cg}</option>
                ))}
              </select>

              <select
                className="px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-medium outline-none focus:border-[var(--text-secondary)] transition"
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value)}
              >
                <option value="all">All Fee Status</option>
                <option value="Paid">Fee Paid</option>
                <option value="Partial">Partial Paid</option>
                <option value="Pending">Pending Fees</option>
              </select>
            </>
          )}

          <div className="relative flex-1 lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--text-secondary)] transition"
              placeholder={activeTab === 'faculty' ? "Search faculty..." : "Search name, roll no, github, email..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        {activeTab === 'faculty' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map(inst => {
                const taughtClasses = getInstructorClasses(inst.id);
                return (
                  <div key={inst.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl p-5 flex flex-col justify-between transition shadow-sm gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">{inst.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">{inst.title}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-[var(--text-secondary)] border-y border-[var(--border-color)] py-3">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-[var(--text-muted)]" />
                        <span>{inst.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-[var(--text-muted)]" />
                        <span>Office: {inst.office}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={12} className="text-[var(--text-muted)]" />
                        <span>Spec: {inst.specialization}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[var(--text-muted)] font-medium">{taughtClasses.length} Scheduled Sections</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer" onClick={() => onEditInstructor(inst)} title="Edit">
                          <Edit size={13} />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-400 transition cursor-pointer" onClick={() => onDeleteInstructor(inst.id)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <User size={36} className="text-[var(--text-muted)] mb-3" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No faculty found</h3>
                <p className="text-xs text-[var(--text-secondary)]">Try refining your search terms.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const isExpanded = expandedStudentId === student.id;
                const studentEnrollments = getStudentEnrollments(student.id);
                const status = student.feeStatus || 'Paid';
                const totalF = student.totalFee ?? 45000;
                const paidF = student.paidAmount ?? 45000;
                const dueF = Math.max(0, totalF - paidF);

                return (
                  <div key={student.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] rounded-xl overflow-hidden transition shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-card-hover)] transition gap-3" onClick={() => toggleStudentExpand(student.id)}>
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-8 h-8 rounded-md bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                          <GraduationCap size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {student.sNo && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">S.No #{student.sNo}</span>}
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">{student.name}</h3>
                            {student.rollNo && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">{student.rollNo}</span>}
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)]">{student.email} {student.phone ? `• ${student.phone}` : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Fee Status Chip */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                          status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : status === 'Partial'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                        }`}>
                          <CreditCard size={11} />
                          <span>Fee: {status}</span>
                          {status === 'Partial' && <span className="opacity-80"> (₹{paidF.toLocaleString()})</span>}
                        </span>

                        {student.github && (
                          <a 
                            href={student.github.startsWith('http') ? student.github : `https://${student.github}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded text-slate-200 bg-slate-800/60 border border-slate-700 hover:bg-slate-700/80 transition text-decoration-none"
                            onClick={(e) => e.stopPropagation()}
                            title="GitHub Profile"
                          >
                            <GithubIcon size={11} />
                            <span>GitHub</span>
                          </a>
                        )}
                        {student.linkedin && (
                          <a 
                            href={student.linkedin.startsWith('http') ? student.linkedin : `https://${student.linkedin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded text-sky-400 bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 transition text-decoration-none"
                            onClick={(e) => e.stopPropagation()}
                            title="LinkedIn Profile"
                          >
                            <LinkedinIcon size={11} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {student.bloodGroup && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded text-rose-400 bg-rose-500/10 border border-rose-500/25">
                            <Droplet size={10} />
                            {student.bloodGroup}
                          </span>
                        )}
                        <div className="text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-card-hover)] border border-[var(--border-color)] px-2 py-0.5 rounded">
                          <span>{student.classGroup}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button className="p-1.5 rounded-md hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer" onClick={(e) => { e.stopPropagation(); onEditStudent(student); }} title="Edit">
                          <Edit size={13} />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-rose-400 transition cursor-pointer" onClick={(e) => { e.stopPropagation(); onDeleteStudent(student.id); }} title="Delete">
                          <Trash2 size={13} />
                        </button>
                        <div className="text-[var(--text-muted)] ml-1">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[var(--border-color)] bg-[var(--bg-card-hover)] p-4 md:p-5 animate-fade-in flex flex-col gap-4">
                        {/* Fee Details Banner */}
                        <div className="bg-[var(--bg-card)] p-3.5 rounded-lg border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${
                              status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : status === 'Partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              <CreditCard size={18} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <span>Fee Status: {status}</span>
                                {status === 'Paid' && <CheckCircle2 size={13} className="text-emerald-400" />}
                                {status === 'Pending' && <AlertCircle size={13} className="text-rose-400" />}
                              </h4>
                              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                Total Tuition Fee: ₹{totalF.toLocaleString()} • Paid: ₹{paidF.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">Outstanding Balance</span>
                            <div className={`text-sm font-extrabold ${dueF > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ₹{dueF.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Student Marks & Personal Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><FileText size={11} /> S.No</span>
                            <span className="text-xs font-semibold text-amber-400 truncate">#{student.sNo || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><FileText size={11} /> Roll Number</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{student.rollNo || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><Mail size={11} /> Email</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate" title={student.email}>{student.email || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><Phone size={11} /> Phone Number</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{student.phone || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><GithubIcon size={11} /> GitHub Profile</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                              {student.github ? (
                                <a href={student.github.startsWith('http') ? student.github : `https://${student.github}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                                  {student.github.replace(/^https?:\/\/(www\.)?github\.com\/?/, '')} <ExternalLink size={10} />
                                </a>
                              ) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><LinkedinIcon size={11} /> LinkedIn</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                              {student.linkedin ? (
                                <a href={student.linkedin.startsWith('http') ? student.linkedin : `https://${student.linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:underline">
                                  LinkedIn Profile <ExternalLink size={10} />
                                </a>
                              ) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><Calendar size={11} /> Date of Birth</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{student.dob || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><Droplet size={11} /> Blood Group</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{student.bloodGroup || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)]">Subject Group</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{student.group || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[var(--text-muted)]">Medium</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{student.medium || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                            <span className="text-[10px] font-medium text-[var(--text-muted)]">10th Mark</span>
                            <span className="text-xs font-bold text-emerald-400">{student.mark10 || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                            <span className="text-[10px] font-medium text-[var(--text-muted)]">11th Mark</span>
                            <span className="text-xs font-bold text-emerald-400">{student.mark11 || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                            <span className="text-[10px] font-medium text-[var(--text-muted)]">12th Mark</span>
                            <span className="text-xs font-bold text-emerald-400">{student.mark12 || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">Course Registrations</h4>
                          <button className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1 transition cursor-pointer" onClick={() => onAddEnrollment(student.id)}>
                            <Plus size={12} />
                            Enroll Course
                          </button>
                        </div>

                        {studentEnrollments.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {studentEnrollments.map(enr => (
                              <div key={enr.enrollmentId} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg flex items-center justify-between text-xs">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[var(--text-primary)]">{enr.code}</span>
                                    <span className="text-[11px] font-semibold text-emerald-400">({enr.grade})</span>
                                  </div>
                                  <span className="text-[11px] text-[var(--text-secondary)] block truncate max-w-[180px]">{enr.name}</span>
                                </div>
                                <button className="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition cursor-pointer" onClick={() => onDeleteEnrollment(enr.enrollmentId)} title="Remove Enrollment">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--text-muted)] italic">No active course registrations for this student.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <GraduationCap size={36} className="text-[var(--text-muted)] mb-3" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No student records found</h3>
                <p className="text-xs text-[var(--text-secondary)]">Try refining your search terms or filters.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
