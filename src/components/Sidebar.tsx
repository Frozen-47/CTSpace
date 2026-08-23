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
  useSupabase?: boolean;
  currentRole: 'admin' | 'faculty' | 'student';
  setCurrentRole: (role: 'admin' | 'faculty' | 'student') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme,
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
    <aside className="w-70 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col h-screen sticky top-0 p-6 transition-colors select-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[var(--text-primary)] text-[var(--bg-app)] w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
          <Database size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-[var(--text-primary)] leading-tight tracking-tight">CTSpace</h1>
          <span className="text-xs text-[var(--text-muted)] font-medium">CT Department</span>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2.5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
          <RoleIcon size={16} />
          <span>{roleLabels[currentRole].label}</span>
        </div>
        <button 
          className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded text-[11px] px-2 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-active)] font-medium transition cursor-pointer" 
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

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-left transition cursor-pointer ${
                isActive 
                  ? 'text-[var(--text-primary)] bg-[var(--bg-active)] shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-[var(--text-primary)] rounded-r" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border-color)] pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-card)] rounded-md border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span>Supabase Online</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">v1.2</span>
        </div>
        
        <button 
          className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color-hover)] text-[var(--text-primary)] font-semibold text-xs transition cursor-pointer" 
          onClick={toggleTheme} 
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
