import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import TaskModal from '../components/TaskModal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { isAdmin } from '../utils/roleGuard';
import { formatDate, isOverdue } from '../utils/formatDate';
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle,
  Calendar, MoreVertical
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/* ── helpers ──────────────────────────────────────────────── */
function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

/* ── sub-components ───────────────────────────────────────── */
function StatCard({ label, sub, value, iconBg, iconColor, Icon }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>{label}</p>
          <p style={{ color: 'var(--color-text-primary)', fontSize: '42px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginTop: '8px', lineHeight: 1.1 }}>
            {value ?? 0}
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px' }}>{sub}</p>
        </div>
        <div
          style={{
            width: '52px', height: '52px',
            borderRadius: '12px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={24} color={iconColor} />
        </div>
      </div>
    </div>
  );
}

const priorityConfig = {
  high:   { bg: 'rgba(239,68,68,0.1)',    text: 'var(--color-danger)', dot: '#ef4444'  },
  medium: { bg: 'rgba(245,158,11,0.1)',   text: 'var(--color-text-primary)', dot: '#f59e0b'  },
  low:    { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80', dot: '#22c55e'  },
};

/* ✅ STATUS BADGE STYLING UPDATED HERE */
const statusConfig = {
  'todo': {
    bg: '#FEF9C3',
    text: '#854D0E', // yellow styling for Upcoming
    label: 'Upcoming',
  },
  'in-progress': {
    bg: '#DBEAFE',
    text: '#1E40AF', // blue styling for In Progress
    label: 'In Progress',
  },
  'done': {
    bg: '#DCFCE7',
    text: '#166534', // green styling for Completed
    label: 'Completed',
  },
};

function PriorityBadge({ priority = 'medium' }) {
  const cfg = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '9999px',
      background: cfg.bg, color: cfg.text, fontSize: '12px', fontWeight: 500,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function StatusBadge({ status = 'todo' }) {
  const cfg = statusConfig[status] || statusConfig.todo;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px', borderRadius: '9999px',
      background: cfg.bg, color: cfg.text, fontSize: '12px', fontWeight: 500,
    }}>
      {cfg.label}
    </span>
  );
}

/* ── main page ────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, setTasks, stats, loading, fetchTasks, fetchStats, updateTask, createTask, deleteTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDeleteTask = async (taskId) => {
    console.log('Attempting to delete task:', taskId);
    
    if (!taskId) {
      toast.error('Invalid task ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      console.log('Delete response:', response.data);
      
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setOpenMenu(null);
      fetchStats();
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete task');
      setOpenMenu(null);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, [fetchStats, fetchTasks]);

  const handleSubmit = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await createTask(formData);
    }
    fetchStats();
    setEditingTask(null);
  };

  const recentTasks = tasks.slice(0, 6);

  return (
    <div className="page-enter">
      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="font-syne" style={{ color: 'var(--color-text-primary)', fontSize: '32px', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        {/* Date pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '8px 14px',
        }}>
          <Calendar size={16} color="var(--color-text-primary)" />
          <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>{getTodayLabel()}</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stat-cards-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[120px] bg-[#161b27] rounded-[14px]" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Tasks" sub="All assigned tasks"
              value={stats.total}
              iconBg="rgba(99,102,241,0.15)" iconColor="var(--color-text-primary)"
              Icon={ClipboardList}
            />
            <StatCard
              label="Completed" sub="Tasks completed"
              value={stats.completed}
              iconBg="rgba(16,185,129,0.15)" iconColor="var(--color-text-primary)"
              Icon={CheckCircle2}
            />
            <StatCard
              label="In Progress" sub="Tasks in progress"
              value={stats.pending}
              iconBg="rgba(245,158,11,0.15)" iconColor="var(--color-text-primary)"
              Icon={Clock}
            />
            <StatCard
              label="Overdue" sub="Tasks overdue"
              value={stats.overdue}
              iconBg="rgba(239,68,68,0.15)" iconColor="var(--color-danger)"
              Icon={AlertTriangle}
            />
          </>
        )}
      </div>

      {/* ── Recent Tasks ── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {/* Section header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 800, fontSize: '20px', fontFamily: 'Syne, sans-serif' }}>Recent Tasks</span>
          <Link
            to="/tasks"
            style={{
              color: 'var(--color-text-primary)', fontSize: '14px', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
            className="view-all-link"
          >
            View all tasks →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '0 24px 24px' }}>
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-lg mb-2" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div style={{ padding: '24px' }}>
            <EmptyState
              title="No tasks yet"
              description="You don't have any tasks assigned to you right now."
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  {['TITLE', 'PROJECT', 'PRIORITY', 'STATUS', 'DUE DATE', 'ASSIGNEE', ''].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '12px 24px',
                        color: 'var(--color-text-muted)',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr
                    key={task._id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s',
                    }}
                    className="dashboard-task-row"
                  >
                    {/* Title */}
                    <td style={{ padding: '16px 24px' }}>
                      <span
                        style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => {
                          if (isAdmin(user)) setEditingTask(task);
                          setShowModal(true);
                        }}
                      >
                        {task.title}
                      </span>
                    </td>

                    {/* Project */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                        {task.project?.title || '—'}
                      </span>
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '16px 24px' }}>
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 24px' }}>
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Due Date */}
                    <td style={{ padding: '16px 24px' }}>
                      {task.dueDate ? (
                        <span style={{
                          fontSize: '14px',
                          color: isOverdue(task.dueDate, task.status) ? 'var(--color-danger)' : '#94a3b8',
                          fontWeight: isOverdue(task.dueDate, task.status) ? 500 : 400,
                        }}>
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Assignee */}
                    <td style={{ padding: '16px 24px' }}>
                      {task.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px',
                            borderRadius: '50%',
                            background: 'var(--color-pill-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: 700,
                            flexShrink: 0,
                          }}>
                            {getInitials(task.assignedTo.name)}
                          </div>
                          <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>
                            {task.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 24px' }} onClick={e => e.stopPropagation()}>
                      <div ref={openMenu === task._id ? menuRef : null} style={{ position:'relative' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); 
                            setOpenMenu(openMenu === task._id ? null : task._id); }}
                          style={{ background:'none', border:'none', cursor:'pointer',
                                   padding:'6px', borderRadius:6, color:'#475569',
                                   display:'flex', alignItems:'center' }}
                          onMouseEnter={e => e.currentTarget.style.color='#94a3b8'}
                          onMouseLeave={e => e.currentTarget.style.color='#475569'}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openMenu === task._id && (
                          <div style={{
                            position:'absolute', right:0, top:'100%', marginTop:4,
                            background:'var(--color-surface)', border:'1px solid rgba(255,255,255,0.1)',
                            borderRadius:10, overflow:'hidden', zIndex:50, minWidth:160,
                            boxShadow:'0 10px 30px rgba(0,0,0,0.4)'
                          }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/projects/${task.project?._id || task.project}`); setOpenMenu(null); }}
                              style={{ width:'100%', padding:'10px 14px', background:'none',
                                       border:'none', color:'#cbd5e1', fontSize:'13px',
                                       cursor:'pointer', textAlign:'left', display:'flex',
                                       alignItems:'center', gap:8 }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background='none'}
                            >
                              👁 View Task
                            </button>
                            
                            {user?.role === 'admin' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                style={{ width:'100%', padding:'10px 14px', background:'none',
                                         border:'none', color:'var(--color-danger)', fontSize:'13px',
                                         cursor:'pointer', textAlign:'left', display:'flex',
                                         alignItems:'center', gap:8,
                                         borderTop:'1px solid rgba(255,255,255,0.05)' }}
                                onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background='none'}
                              >
                                🗑 Delete Task
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSubmit={handleSubmit}
        task={editingTask}
      />
    </div>
  );
}