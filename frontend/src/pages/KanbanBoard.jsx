import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Skeleton from '../components/Skeleton';
import { formatDate, isOverdue } from '../utils/formatDate';

const priorityBorder = { high: '#7A1D1D', medium: 'var(--color-accent)', low: 'var(--color-text-muted)' };
const priorityCfg = {
  high:   { bg: '#FFD1D1',  text: '#7A1D1D', dot: '#7A1D1D' },
  medium: { bg: 'var(--color-accent)', text: 'var(--color-text-primary)', dot: 'var(--color-text-primary)' },
  low:    { bg: 'var(--color-pill-bg)',  text: 'var(--color-text-primary)', dot: 'var(--color-text-muted)' },
};

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function KanbanCard({ task, onClick }) {
  const p = task.priority || 'medium';
  const cfg = priorityCfg[p] || priorityCfg.medium;
  return (
    <div
      onClick={onClick}
      className="kanban-card group"
      style={{
        background: 'var(--color-surface)',
        borderRadius: '13px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${priorityBorder[p] || 'var(--color-accent)'}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '99px',
          background: cfg.bg, color: cfg.text, fontSize: '11px', fontWeight: 600,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{task.project?.title || ''}</span>
      </div>

      {/* Title */}
      <p style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, marginTop: '10px' }}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p style={{
          color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '6px',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4
        }}>
          {task.description}
        </p>
      )}

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        {task.assignedTo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '99px', background: 'var(--color-pill-bg)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-primary)', fontSize: '10px', fontWeight: 700, flexShrink: 0,
            }}>
              {getInitials(task.assignedTo.name)}
            </div>
            <span style={{ color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: 500 }}>{task.assignedTo.name}</span>
          </div>
        ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Unassigned</span>}
        {task.dueDate && (
          <span style={{
            fontSize: '11px',
            background: isOverdue(task.dueDate, task.status) ? '#FFD1D1' : 'var(--color-pill-bg)',
            color: isOverdue(task.dueDate, task.status) ? '#7A1D1D' : 'var(--color-text-muted)',
            fontWeight: 600,
            padding: '2px 8px', borderRadius: '99px',
          }}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

function Column({ title, dot, tasks, navigate }) {
  return (
    <div style={{
      flex: 1, minWidth: '300px', background: 'var(--color-base)', borderRadius: '16px', padding: '16px',
      minHeight: '500px', border: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dot }} />
        <h3 className="font-syne" style={{ color: 'var(--color-text-primary)', fontWeight: 800, fontSize: '16px' }}>{title}</h3>
        <span style={{
          marginLeft: 'auto', background: 'var(--color-text-primary)',
          color: 'var(--color-base)', fontSize: '12px', padding: '2px 8px', borderRadius: '99px', fontWeight: 600,
        }}>{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>No tasks here</p>
      ) : (
        tasks.map(t => (
          <KanbanCard key={t._id} task={t} onClick={() => navigate(`/projects/${t.project?._id || t.project}`)} />
        ))
      )}
    </div>
  );
}

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedProject ? `/tasks?projectId=${selectedProject}` : '/tasks';
    api.get(url)
      .then(r => setTasks(r.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const done = tasks.filter(t => t.status === 'done');

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-syne" style={{ color: 'var(--color-text-primary)', fontSize: '32px', fontWeight: 800 }}>Kanban Board</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '6px' }}>All tasks across projects</p>
        </div>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '99px', padding: '10px 16px', color: 'var(--color-text-primary)', fontSize: '14px',
            outline: 'none', cursor: 'pointer', minWidth: '180px', fontWeight: 500,
          }}
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {/* Columns */}
      {loading ? (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, background: 'var(--color-base)', borderRadius: '16px', padding: '16px', minHeight: '400px', border: '1px solid var(--color-border)' }}>
              <Skeleton className="h-8 w-32 bg-[var(--color-border)] rounded-[99px] mb-4" />
              {[1,2,3].map(j => <Skeleton key={j} className="h-28 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[13px] mb-3" />)}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          <Column title="Upcoming" dot="#CA8A04" tasks={todo} navigate={navigate} />
          <Column title="In Progress" dot="var(--color-accent)" tasks={inProgress} navigate={navigate} />
          <Column title="Completed" dot="var(--color-text-primary)" tasks={done} navigate={navigate} />
        </div>
      )}
    </div>
  );
}