import React, { useState } from 'react';
import { Database, RefreshCw, Check, Copy, Download, Upload, ShieldCheck, HardDrive } from 'lucide-react';
import { db } from '../services/db';

interface AdminPanelProps {
  useSupabase?: boolean;
  onToggleSupabase?: (value: boolean) => void;
  onResetDatabase: () => Promise<void>;
  onRefreshData?: () => Promise<void>;
  statusMessage?: { type: 'success' | 'error'; text: string } | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  useSupabase: _useSupabase,
  onToggleSupabase: _onToggleSupabase,
  onResetDatabase,
  onRefreshData,
  statusMessage
}) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [importing, setImporting] = useState(false);

  const sqlMigration = `-- CTSpace Supabase PostgreSQL Migration & Seed Script

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT 'c-' || md5(random()::text),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  credits INT NOT NULL DEFAULT 3
);

-- 2. Instructors Table
CREATE TABLE IF NOT EXISTS instructors (
  id TEXT PRIMARY KEY DEFAULT 'i-' || md5(random()::text),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  office TEXT,
  title TEXT NOT NULL,
  specialization TEXT
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT 's-' || md5(random()::text),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  class_group TEXT NOT NULL
);

-- 4. Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY DEFAULT 'cls-' || md5(random()::text),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id TEXT REFERENCES instructors(id) ON DELETE SET NULL,
  room TEXT NOT NULL,
  schedule_days TEXT[] NOT NULL,
  schedule_time TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 30,
  term TEXT NOT NULL DEFAULT 'Fall 2026',
  class_group TEXT NOT NULL
);

-- 5. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY DEFAULT 'e-' || md5(random()::text),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  grade TEXT NOT NULL DEFAULT 'IP',
  UNIQUE(student_id, class_id)
);

-- Enable RLS & Allow Anonymous Access for Demo
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write Courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Instructors" ON instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Enrollments" ON enrollments FOR ALL USING (true) WITH CHECK (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlMigration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async () => {
    if (!window.confirm("Restore default mock seeds? Any local overrides will be removed.")) {
      return;
    }
    setResetting(true);
    await onResetDatabase();
    setResetting(false);
  };

  const handleExportJSON = async () => {
    try {
      const jsonStr = await db.exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ctspace_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImporting(true);
        const content = e.target?.result as string;
        await db.importDatabaseJSON(content);
        if (onRefreshData) await onRefreshData();
        alert("Database backup imported successfully!");
      } catch (err: any) {
        alert(`Import error: ${err.message}`);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <header className="mb-2">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Administration</h1>
        <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Database engines, migration setup, and local state management tools.</p>
      </header>

      {/* Free Database Banner */}
      <section className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck size={22} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">100% Free Built-in Local Database</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">CTSpace comes with a 100% free, zero-cost, serverless database engine built directly into your browser.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-[var(--bg-card)] px-3 py-1.5 rounded-md border border-emerald-500/20">
            <HardDrive size={13} />
            <span>Zero Subscription or Cloud Fees</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-[var(--bg-card)] px-3 py-1.5 rounded-md border border-emerald-500/20">
            <Check size={13} />
            <span>Instant Client-Side Persistence</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-[var(--bg-card)] px-3 py-1.5 rounded-md border border-emerald-500/20">
            <Download size={13} />
            <span>One-Click Backup Export & Import</span>
          </div>
        </div>
      </section>

      {/* Database Engine Status */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Database size={18} className="text-emerald-400 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Supabase Engine Active</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">CTSpace is exclusively configured with remote Supabase PostgreSQL persistence.</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-4 rounded-lg flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
          <div className="flex-1">
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Supabase Client Connected</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Real-time CRUD operations, student rosters, curriculum, and course instances are managed directly via Supabase PostgreSQL.</p>
          </div>
        </div>
      </section>

      {/* Backup & Data Management */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <HardDrive size={18} className="text-[var(--text-secondary)] mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Free Backup & Data Management</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Export your full database to a JSON file or restore from a previous backup.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg p-4 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Export Database</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Download a complete `.json` snapshot of all courses, instructors, students, classes, and enrollments.</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer self-start" onClick={handleExportJSON}>
              <Download size={13} /> Export JSON Snapshot
            </button>
          </div>

          <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg p-4 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Import Database</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Restore database records from an exported `.json` snapshot file.</p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer self-start">
              <Upload size={13} /> {importing ? 'Importing...' : 'Upload JSON File'}
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>
      </section>

      {/* Factory Reset */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <RefreshCw size={18} className="text-[var(--text-secondary)] mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Factory Data Reset</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Restore original seed dataset.</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">Erase local workspace modifications and restore curriculum and roster initial default values.</p>
          <button className="px-4 py-2 rounded-md border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition cursor-pointer shrink-0" onClick={handleReset} disabled={resetting}>
            {resetting ? 'Resetting...' : 'Reset to Default Seeds'}
          </button>
        </div>
      </section>

      {/* DDL Script */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Database size={18} className="text-[var(--text-secondary)] mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">DDL Migrations</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Run these DDL commands in your Supabase SQL Editor to initialize matching tables.</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
            <span className="text-xs font-mono text-[var(--text-secondary)]">schema.sql</span>
            <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-card-hover)] text-xs font-semibold transition cursor-pointer" onClick={copyToClipboard}>
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3.5 max-h-48 overflow-y-auto font-mono text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            <code>{sqlMigration}</code>
          </pre>
        </div>
      </section>

      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
          statusMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
        }`}>
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
