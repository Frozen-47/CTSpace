import React, { useState } from 'react';
import { Database, RefreshCw, AlertTriangle, Check, Copy } from 'lucide-react';

interface AdminPanelProps {
  useSupabase: boolean;
  onToggleSupabase: (value: boolean) => void;
  onResetDatabase: () => Promise<void>;
  statusMessage?: { type: 'success' | 'error'; text: string } | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  useSupabase,
  onToggleSupabase,
  onResetDatabase,
  statusMessage
}) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  const sqlMigration = `-- CTSpace PostgreSQL Schema Migration Script

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
  instructor_id TEXT REFERENCES instructors(id) ON SET NULL,
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
);`;

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

  return (
    <div className="admin-panel-view animate-fade-in">
      <header className="view-header">
        <div>
          <h1>Administration</h1>
          <p className="subtitle">Database engines, migration setup, and local state reset tools.</p>
        </div>
      </header>

      <section className="admin-section card">
        <div className="admin-section-header">
          <Database size={18} className="section-icon" />
          <div>
            <h2>Database Engine</h2>
            <p>Select connection provider for class data storage.</p>
          </div>
        </div>

        <div className="engine-toggle-box">
          <div className="engine-options">
            <div className={`engine-option ${!useSupabase ? 'selected' : ''}`} onClick={() => onToggleSupabase(false)}>
              <div className="option-indicator" />
              <div>
                <h3>Mock Storage</h3>
                <p>Stores data locally in your browser. Zero setup required.</p>
              </div>
            </div>
            
            <div className={`engine-option ${useSupabase ? 'selected' : ''}`} onClick={() => onToggleSupabase(true)}>
              <div className="option-indicator" />
              <div>
                <h3>Supabase Client</h3>
                <p>Connects to remote PostgreSQL server. Requires env credentials.</p>
              </div>
            </div>
          </div>
        </div>

        {useSupabase && (
          <div className="supabase-warning-alert">
            <AlertTriangle size={14} />
            <span>Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in your workspace variables.</span>
          </div>
        )}
      </section>

      <section className="admin-section card">
        <div className="admin-section-header">
          <RefreshCw size={18} className="section-icon" />
          <div>
            <h2>Data Reset</h2>
            <p>Restore seed database items.</p>
          </div>
        </div>

        <div className="reset-action-box">
          <p className="description-text">Erase local workspace changes and restore curriculum and roster default values. This is irreversible.</p>
          <button className="btn btn-danger" onClick={handleReset} disabled={resetting || useSupabase}>
            {resetting ? 'Resetting...' : 'Reset Local Storage'}
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
