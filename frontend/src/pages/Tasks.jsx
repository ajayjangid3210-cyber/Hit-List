import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/roleGuard';
import TaskModal from '../components/TaskModal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { formatDate, isOverdue } from '../utils/formatDate';
import { MoreVertical } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Upcoming', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'done' },
];

const priorityConfig = {
  high: { bg: 'rgba(239,68,68,0.1)', text: 'var(--color-danger)', dot: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', dot: '#f59e0b' },
  low: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', dot: '#22c55e' },
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
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        background: cfg.bg,
        color: cfg.text,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function StatusBadge({ status = 'todo' }) {
  const cfg = statusConfig[status] || statusConfig.todo;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '9999px',
        background: cfg.bg,
        color: cfg.text,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {cfg.label}
    </span>
  );
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Tasks() {
  const { user } = useAuth();
  const { tasks, setTasks, loading, fetchTasks, updateTask, createTask } = useTasks();
  const [statusFilter, setStatusFilter] = useState('');
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
    if (!taskId) return;

    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setOpenMenu(null);
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
      setOpenMenu(null);
    }
  };

  useEffect(() => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    fetchTasks(filters);
  }, [statusFilter, fetchTasks]);

  const visibleTasks = tasks;

  const handleSubmit = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await createTask(formData);
    }
    setEditingTask(null);
  };

  return (
    <div className="page-enter">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            className="font-syne"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: '32px',
              fontWeight: 800,
            }}
          >
            Tasks
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '24px' }}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-14 w-full bg-[var(--color-border)] rounded-lg mb-2"
                />
              ))}
          </div>
        ) : visibleTasks.length === 0 ? (
          <div style={{ padding: '40px 24px' }}>
            <EmptyState
              title="No tasks found"
              description="No tasks match your current filter."
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '800px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {['TITLE', 'PROJECT', 'PRIORITY', 'STATUS', 'DUE DATE', 'ASSIGNEE', ''].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: '12px 20px',
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
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => (
                  <tr
                    key={task._id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setEditingTask(task);
                      setShowModal(true);
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          color: 'var(--color-text-primary)',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        {task.title}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: '14px',
                        }}
                      >
                        {task.project?.title || '—'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={task.status} />
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      {task.dueDate ? (
                        <span
                          style={{
                            fontSize: '14px',
                            color: isOverdue(task.dueDate, task.status)
                              ? 'var(--color-danger)'
                              : '#94a3b8',
                          }}
                        >
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      {user?.role === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task._id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-danger)',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      )}
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
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        task={editingTask}
      />
    </div>
  );
}