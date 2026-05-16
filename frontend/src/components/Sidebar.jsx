import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, FolderOpen, CheckSquare, Columns2,
  Calendar, Users, BarChart2, Settings, LogOut, ListChecks,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',     icon: FolderOpen },
  { to: '/tasks',     label: 'Tasks',        icon: CheckSquare },
  { to: '/kanban',    label: 'Kanban Board', icon: Columns2 },
  { to: '/calendar',  label: 'Calendar',     icon: Calendar },
  { to: '/team',      label: 'Team',         icon: Users },
  { to: '/reports',   label: 'Reports',      icon: BarChart2 },
  { to: '/settings',  label: 'Settings',     icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar${isOpen ? ' open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--color-accent)',
            borderRadius: '99px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ListChecks size={18} color="var(--color-text-primary)" />
          </div>
          <span className="font-syne" style={{
            color: 'var(--color-text-primary)', fontWeight: 800,
            fontSize: 20, marginLeft: 12, lineHeight: 1,
          }}>
            Hit List
          </span>
        </div>

        {/* Nav */}
        <nav style={{
          padding: '12px 16px', flex: 1, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                padding: '12px 16px', borderRadius: '99px',
                cursor: 'pointer', fontSize: 15, gap: 12,
                textDecoration: 'none',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.2s ease',
                background: isActive ? 'var(--color-text-primary)' : 'var(--color-pill-bg)',
                color: isActive ? 'var(--color-base)' : 'var(--color-text-primary)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} color={isActive ? 'var(--color-accent)' : 'var(--color-text-primary)'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', flexShrink: 0 }}>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', color: 'var(--color-danger)',
              fontSize: 15, background: 'transparent', border: 'none',
              cursor: 'pointer', width: '100%', fontWeight: 500,
              borderRadius: '99px', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}