import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Users, 
  Sliders, 
  Sun, 
  Moon,
  Database,
  Shield,
  UserCheck,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  useSupabase: boolean;
  currentRole: 'admin' | 'faculty' | 'student';
  setCurrentRole: (role: 'admin' | 'faculty' | 'student') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme,
  useSupabase,
  currentRole,
  setCurrentRole
}) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'schedule', label: 'Class Schedule', icon: Calendar },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'admin', label: 'Admin Panel', icon: Sliders },
  ];

  const roleLabels = {
    admin: { label: 'Admin Mode', icon: Shield, badgeClass: 'badge-admin' },
    faculty: { label: 'Faculty View', icon: UserCheck, badgeClass: 'badge-faculty' },
    student: { label: 'Student View', icon: GraduationCap, badgeClass: 'badge-student' }
  };

  const RoleIcon = roleLabels[currentRole].icon;

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Database size={24} className="brand-icon" />
        </div>
        <div className="brand-text">
          <h1>CTSpace</h1>
          <span>CT Department</span>
        </div>
      </div>

      <div className="role-sidebar-card">
        <div className="role-card-header">
          <RoleIcon size={16} />
          <span>{roleLabels[currentRole].label}</span>
        </div>
        <button 
          className="role-switch-btn" 
          onClick={() => {
            setActiveTab('dashboard');
            const roles: ('admin' | 'faculty' | 'student')[] = ['admin', 'faculty', 'student'];
            const nextIdx = (roles.indexOf(currentRole) + 1) % roles.length;
            setCurrentRole(roles[nextIdx]);
          }}
          title="Click to cycle role"
        >
          Switch Role
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-item-icon" />
              <span>{item.label}</span>
              {activeTab === item.id && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="db-badge">
          <div className={`db-indicator ${useSupabase ? 'supabase' : 'mock'}`} />
          <span>{useSupabase ? 'Supabase Connected' : 'Local Storage Mock'}</span>
        </div>
        
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? (
            <>
              <Sun size={18} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: 280px;
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          padding: 24px;
          transition: background-color var(--transition-normal), border-color var(--transition-normal);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .role-sidebar-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .role-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .role-switch-btn {
          background-color: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-secondary);
          font-size: 0.7rem;
          padding: 4px 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .role-switch-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-color-hover);
          background-color: var(--bg-active);
        }

        .brand-logo {
          background-color: var(--primary);
          color: white;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-accent);
        }

        .brand-text h1 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .brand-text span {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          position: relative;
          transition: all var(--transition-fast);
        }

        .nav-item:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
        }

        .nav-item.active {
          color: var(--primary);
          background-color: var(--bg-active);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 4px;
          background-color: var(--primary);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .db-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: var(--bg-card);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .db-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .db-indicator.supabase {
          background-color: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        .db-indicator.mock {
          background-color: var(--warning);
          box-shadow: 0 0 8px var(--warning);
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--bg-card);
          color: var(--text-primary);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .theme-toggle-btn:hover {
          background-color: var(--bg-card-hover);
          border-color: var(--border-color-hover);
        }
      `}</style>
    </aside>
  );
};
