import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
  '/tasks':     'Tasks',
  '/kanban':    'Kanban Board',
  '/calendar':  'Calendar',
  '/team':      'Team',
  '/reports':   'Reports',
  '/settings':  'Settings',
};

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching,   setSearching]   = useState(false);
  const searchRef = useRef(null);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [showNotifs,    setShowNotifs]    = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const notifRef = useRef(null);

  /* ── Notifications ── */
  useEffect(() => {
    const build = async () => {
      try {
        const tasksRes = await api.get('/tasks');
        const tasks = tasksRes.data.tasks || tasksRes.data.data || tasksRes.data || [];
        const notifs = [];

        tasks.forEach(task => {
          if (task.dueDate && task.status !== 'done') {
            const today    = new Date(); today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
            const dueDay   = new Date(task.dueDate); dueDay.setHours(0, 0, 0, 0);

            if (dueDay < today) {
              notifs.push({
                id: `overdue-${task._id}`, type: 'overdue', icon: '🔴',
                title: 'Task Overdue',
                message: `"${task.title}" is past its deadline`,
                time: task.dueDate, read: false,
                link: `/projects/${task.project?._id || task.project}`,
              });
            } else if (dueDay.getTime() === tomorrow.getTime()) {
              notifs.push({
                id: `due-${task._id}`, type: 'due_soon', icon: '⚠️',
                title: 'Due Tomorrow',
                message: `"${task.title}" is due tomorrow`,
                time: task.dueDate, read: false,
                link: `/projects/${task.project?._id || task.project}`,
              });
            }
          }
        });

        notifs.push({
          id: 'welcome', type: 'info', icon: '👋',
          title: 'Welcome to Hit List',
          message: 'Your workspace is ready. Create your first task!',
          time: new Date().toISOString(), read: true, link: '/dashboard',
        });

        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } catch (e) {
        console.error('Notification error:', e);
      }
    };
    build();
  }, []);

  /* ── Search ── */
  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowResults(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get(`/tasks?search=${query}`),
          api.get(`/projects?search=${query}`),
        ]);
        const tasks = (tasksRes.data.tasks || tasksRes.data.data || tasksRes.data || [])
          .filter(t => t.title?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4).map(t => ({ ...t, _type: 'task' }));
        const projects = (projectsRes.data.projects || projectsRes.data.data || projectsRes.data || [])
          .filter(p => p.title?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3).map(p => ({ ...p, _type: 'project' }));
        setResults([...tasks, ...projects]);
        setShowResults(true);
      } catch (e) { /* silent */ }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handler = e => {
      if (searchRef.current   && !searchRef.current.contains(e.target))   setShowResults(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current    && !notifRef.current.contains(e.target))    setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenNotifs = () => {
    setShowNotifs(prev => !prev);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const title =
    routeTitles[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Projects' : 'Dashboard');

  return (
    <header className="app-navbar">

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* ✅ FIX: removed display:'flex' from inline style — it was
            overriding lg:hidden and breaking the Tailwind class.
            Now .hamburger-btn CSS class controls visibility. */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="hamburger-btn"
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--color-text-primary)', cursor: 'pointer',
            padding: 8, marginLeft: -8, borderRadius: 8, lineHeight: 0,
          }}
        >
          <Menu size={22} />
        </button>

        <span className="font-syne" style={{
          color: 'var(--color-text-primary)', fontWeight: 800,
          fontSize: 24, marginLeft: 4,
        }}>
          {title}
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative' }} className="hidden sm:block">
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '8px 14px', width: 240,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query && setShowResults(true)}
              placeholder="Search tasks, projects..."
              style={{
                background: 'transparent', color: 'var(--color-text-primary)',
                fontSize: 14, outline: 'none', border: 'none', width: '100%',
              }}
            />
          </div>

          {searching && (
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <div className="animate-spin" style={{
                width: 16, height: 16,
                border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%',
              }} />
            </div>
          )}

          {showResults && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              width: 360, background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 12,
              overflow: 'hidden', zIndex: 100,
            }}>
              {results.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                  No results for "{query}"
                </div>
              ) : (
                <>
                  {results.filter(r => r._type === 'task').length > 0 && (
                    <div>
                      <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>
                        Tasks
                      </div>
                      {results.filter(r => r._type === 'task').map(task => (
                        <div key={task._id}
                          onClick={() => { navigate(`/projects/${task.project?._id || task.project}`); setShowResults(false); setQuery(''); }}
                          style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--color-border)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            background: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981',
                          }} />
                          <div>
                            <div style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 500 }}>{task.title}</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 2 }}>{task.project?.title || 'Task'}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', fontSize: 11, color: task.status === 'done' ? '#10b981' : task.status === 'in-progress' ? '#60a5fa' : '#94a3b8' }}>
                            {task.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.filter(r => r._type === 'project').length > 0 && (
                    <div>
                      <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>
                        Projects
                      </div>
                      {results.filter(r => r._type === 'project').map(proj => (
                        <div key={proj._id}
                          onClick={() => { navigate(`/projects/${proj._id}`); setShowResults(false); setQuery(''); }}
                          style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: 'var(--color-pill-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📁</div>
                          <div style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 500 }}>{proj.title}</div>
                          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-muted)' }}>{proj.members?.length || 0} members</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 12 }}
                    onClick={() => { navigate('/tasks'); setShowResults(false); setQuery(''); }}
                  >
                    View all tasks →
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={handleOpenNotifs}
            style={{
              position: 'relative', width: 38, height: 38, borderRadius: '50%',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface)')}
          >
            🔔
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: -3, right: -3,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--color-accent)', color: 'var(--color-text-primary)',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--color-surface)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: 360, background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 14,
              overflow: 'hidden', zIndex: 100,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                  {notifications.filter(n => !n.read).length === 0 ? 'All caught up ✓' : `${notifications.filter(n => !n.read).length} unread`}
                </span>
              </div>
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                    <div style={{ color: 'var(--color-text-primary)', fontSize: 14, fontWeight: 500 }}>No notifications</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 4 }}>You're all caught up!</div>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id}
                      onClick={() => { navigate(notif.link); setShowNotifs(false); }}
                      style={{
                        padding: '14px 16px', cursor: 'pointer',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        borderBottom: '1px solid var(--color-border)',
                        background: notif.read ? 'transparent' : 'var(--color-pill-bg)',
                        borderLeft: notif.read ? '3px solid transparent'
                          : `3px solid ${notif.type === 'overdue' ? '#ef4444' : notif.type === 'due_soon' ? '#f59e0b' : '#6366f1'}`,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = notif.read ? 'transparent' : 'var(--color-pill-bg)')}
                    >
                      <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{notif.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 600 }}>{notif.title}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 4 }}>
                          {notif.time ? new Date(notif.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </div>
                      </div>
                      {!notif.read && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-text-primary)', flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                <span onClick={() => { navigate('/tasks'); setShowNotifs(false); }}
                  style={{ color: 'var(--color-text-primary)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                  View all tasks →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
              background: showUserMenu ? 'var(--color-pill-bg)' : 'transparent',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
            onMouseLeave={e => (!showUserMenu && (e.currentTarget.style.background = 'transparent'))}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 700 }}>
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="hidden sm:flex">
              <span style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{user?.role}</span>
            </div>
            <span style={{ color: 'var(--color-text-muted)', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
          </div>

          {showUserMenu && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', zIndex: 100, minWidth: 220 }}>
              <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)', fontSize: 14, fontWeight: 700 }}>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-primary)', fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--color-pill-bg)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                    {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}
                  </span>
                </div>
              </div>

              {[
                { icon: '⚙️', label: 'Settings', action: () => { navigate('/settings'); setShowUserMenu(false); } },
                { icon: '👥', label: 'Team',     action: () => { navigate('/team');     setShowUserMenu(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', color: 'var(--color-text-primary)', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {item.icon} {item.label}
                </button>
              ))}

              <button
                onClick={() => { logout(); navigate('/login'); setShowUserMenu(false); }}
                style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pill-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}