import React, { useState } from 'react';
import { Database, RefreshCw, AlertTriangle, Check, Copy, Download, Upload, ShieldCheck, HardDrive } from 'lucide-react';
import { db } from '../services/db';

interface AdminPanelProps {
  useSupabase: boolean;
  onToggleSupabase: (value: boolean) => void;
  onResetDatabase: () => Promise<void>;
  onRefreshData?: () => Promise<void>;
  statusMessage?: { type: 'success' | 'error'; text: string } | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  useSupabase,
  onToggleSupabase,
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
    <div className="admin-panel-view animate-fade-in">
      <header className="view-header">
        <div>
          <h1>Administration</h1>
          <p className="subtitle">Database engines, migration setup, and local state management tools.</p>
        </div>
      </header>

      {/* 100% Free Database Banner */}
      <section className="admin-section card free-db-banner">
        <div className="admin-section-header">
          <ShieldCheck size={22} className="text-success" />
          <div>
            <h2>100% Free Built-in Local Database</h2>
            <p>CTSpace comes with a 100% free, zero-cost, serverless database engine built directly into your browser.</p>
          </div>
        </div>
        <div className="free-db-features">
          <div className="free-feature-pill">
            <HardDrive size={14} />
            <span>Zero Subscription or Cloud Fees</span>
          </div>
          <div className="free-feature-pill">
            <Check size={14} />
            <span>Instant Client-Side Persistence</span>
          </div>
          <div className="free-feature-pill">
            <Download size={14} />
            <span>One-Click Backup Export & Import</span>
          </div>
        </div>
      </section>

      <section className="admin-section card">
        <div className="admin-section-header">
          <Database size={18} className="section-icon" />
          <div>
            <h2>Database Engine Selector</h2>
            <p>Select your connection provider for CTSpace data storage.</p>
          </div>
        </div>

        <div className="engine-toggle-box">
          <div className="engine-options">
            <div className={`engine-option ${!useSupabase ? 'selected' : ''}`} onClick={() => onToggleSupabase(false)}>
              <div className="option-indicator" />
              <div>
                <h3>Free Local Browser DB (Recommended)</h3>
                <p>100% free forever. Stores data locally in your browser. Zero setup required.</p>
              </div>
            </div>
            
            <div className={`engine-option ${useSupabase ? 'selected' : ''}`} onClick={() => onToggleSupabase(true)}>
              <div className="option-indicator" />
              <div>
                <h3>Supabase Client (Free Cloud Tier)</h3>
                <p>Connects to a remote PostgreSQL server. Requires free Supabase credentials.</p>
              </div>
            </div>
          </div>
        </div>

        {useSupabase && (
          <div className="supabase-warning-alert">
            <AlertTriangle size={14} />
            <span>Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in your environment variables.</span>
          </div>
        )}
      </section>

      {/* Backup & Data Management */}
      <section className="admin-section card">
        <div className="admin-section-header">
          <HardDrive size={18} className="section-icon" />
          <div>
            <h2>Free Backup & Data Management</h2>
            <p>Export your full database to a JSON file or restore from a previous backup.</p>
          </div>
        </div>

        <div className="backup-actions-grid">
          <div className="backup-card">
            <h4>Export Database</h4>
            <p>Download a complete `.json` snapshot of all courses, instructors, students, classes, and enrollments.</p>
            <button className="btn btn-secondary" onClick={handleExportJSON}>
              <Download size={14} /> Export JSON Snapshot
            </button>
          </div>

          <div className="backup-card">
            <h4>Import Database</h4>
            <p>Restore database records from an exported `.json` snapshot file.</p>
            <label className="btn btn-secondary file-upload-btn">
              <Upload size={14} /> {importing ? 'Importing...' : 'Upload JSON File'}
              <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </section>

      <section className="admin-section card">
        <div className="admin-section-header">
          <RefreshCw size={18} className="section-icon" />
          <div>
            <h2>Factory Data Reset</h2>
            <p>Restore original seed dataset.</p>
          </div>
        </div>

        <div className="reset-action-box">
          <p className="description-text">Erase local workspace modifications and restore curriculum and roster initial default values.</p>
          <button className="btn btn-danger" onClick={handleReset} disabled={resetting || useSupabase}>
            {resetting ? 'Resetting...' : 'Reset to Default Seeds'}
          </button>
        </div>
      </section>

      <section className="admin-section card">
        <div className="admin-section-header">
          <Database size={18} className="section-icon" />
          <div>
            <h2>DDL Migrations</h2>
            <p>Run these DDL commands in your Supabase SQL Editor to initialize matching tables.</p>
          </div>
        </div>

        <div className="sql-script-wrapper">
          <div className="sql-header">
            <span>schema.sql</span>
            <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>
              {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="sql-code-block">
            <code>{sqlMigration}</code>
          </pre>
        </div>
      </section>

      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`}>
          <span>{statusMessage.text}</span>
        </div>
      )}

      <style>{`
        .admin-panel-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .view-header {
          margin-bottom: 8px;
        }

        .view-header h1 {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .free-db-banner {
          background-color: var(--success-bg);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .free-db-features {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .free-feature-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--success);
          background-color: var(--bg-card);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .backup-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 600px) {
          .backup-actions-grid {
            grid-template-columns: 1fr;
          }
        }

        .backup-card {
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .backup-card h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .backup-card p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.3;
          flex: 1;
        }

        .file-upload-btn {
          display: inline-flex;
          cursor: pointer;
        }

        .admin-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 18px;
        }

        .admin-section-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .section-icon {
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .admin-section-header h2 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .admin-section-header p {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .engine-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 600px) {
          .engine-options {
            grid-template-columns: 1fr;
          }
        }

        .engine-option {
          display: flex;
          gap: 10px;
          padding: 14px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .engine-option:hover {
          border-color: var(--border-color-hover);
        }

        .engine-option.selected {
          border-color: var(--text-secondary);
          background-color: var(--bg-active);
        }

        .option-indicator {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
          margin-top: 2px;
          position: relative;
        }

        .engine-option.selected .option-indicator {
          border-color: var(--text-secondary);
        }

        .engine-option.selected .option-indicator::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: var(--text-primary);
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .engine-option h3 {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .engine-option p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
          line-height: 1.3;
        }

        .supabase-warning-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--warning-bg);
          border: 1px solid rgba(245, 158, 11, 0.1);
          color: var(--warning);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .reset-action-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          gap: 16px;
        }

        @media (max-width: 600px) {
          .reset-action-box {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .description-text {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.3;
          flex: 1;
        }

        .sql-script-wrapper {
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .sql-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .sql-code-block {
          padding: 12px;
          max-height: 180px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          text-align: left;
          white-space: pre-wrap;
        }

        .text-success {
          color: var(--success);
        }

        .status-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 20px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          z-index: 2000;
          animation: slideIn 0.2s ease forwards;
        }

        .status-toast.success { background-color: var(--success); }
        .status-toast.error { background-color: var(--danger); }

        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
