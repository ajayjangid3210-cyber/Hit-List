import { formatDate, isOverdue } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/roleGuard';

const priorityColors = {
  'low': 'bg-[rgba(36,31,33,0.07)] text-[var(--color-text-primary)]',
  'medium': 'bg-[var(--color-accent)] text-[var(--color-text-primary)]',
  'high': 'bg-[#FFD1D1] text-[#7A1D1D]'
};

const priorityDots = {
  'low': 'bg-[var(--color-text-muted)]',
  'medium': 'bg-[var(--color-text-primary)]',
  'high': 'bg-[#7A1D1D]'
};

// Add explicit status styles with the yellow color for Upcoming
const statusStyles = {
  'todo':        { bg: '#FEF9C3', text: '#854D0E', label: 'Upcoming' }, // Yellow styling
  'in-progress': { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' },
  'done':        { bg: '#DCFCE7', text: '#166534', label: 'Completed' },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { user } = useAuth();
  const overdue = isOverdue(task.dueDate, task.status);
  const statusCfg = statusStyles[task.status] || statusStyles['todo'];

  return (
    <div className={`card task-card p-4 mb-3 transition-all group relative`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-[14px] font-medium text-[var(--color-text-primary)] leading-tight">
          {task.title}
        </h4>
        {isAdmin(user) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 absolute top-3 right-3 bg-[var(--color-surface)] shadow-sm rounded-full p-1 border border-[var(--color-border)]">
            <button onClick={() => onEdit(task)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1" title="Edit">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => onDelete(task._id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-1" title="Delete">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-[12px] text-[var(--color-text-muted)] mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Badge */}
          <div className={`flex items-center gap-1.5 rounded-[99px] px-2.5 py-1 ${priorityColors[task.priority || 'medium']}`}>
            <span className={`w-1.5 h-1.5 rounded-[99px] ${priorityDots[task.priority || 'medium']}`}></span>
            <span className="text-[11px] font-medium capitalize">{task.priority || 'medium'}</span>
          </div>

          {/* Status Badge added here so you can easily identify task progress */}
          <div
            className="flex items-center rounded-[99px] px-2.5 py-1"
            style={{ background: statusCfg.bg, color: statusCfg.text }}
          >
            <span className="text-[11px] font-medium">{statusCfg.label}</span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-[99px] ${overdue ? 'bg-[#FFD1D1] text-[#7A1D1D]' : 'bg-[var(--color-pill-bg)] text-[var(--color-text-muted)]'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo ? (
          <div className="w-7 h-7 rounded-[99px] bg-[var(--color-base)] flex items-center justify-center text-[var(--color-text-primary)] text-[11px] font-bold shrink-0 border border-[var(--color-border)]" title={task.assignedTo.name}>
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-[99px] bg-[var(--color-pill-bg)] flex items-center justify-center text-[var(--color-text-muted)] text-[11px] shrink-0 border border-[var(--color-border)]" title="Unassigned">
            ?
          </div>
        )}
      </div>
    </div>
  );
}