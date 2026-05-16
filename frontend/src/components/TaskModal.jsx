import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function TaskModal({ isOpen, onClose, onSubmit, task, projectId }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: projectId || '',
    assignedTo: '',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/users')
        ]);
        setProjects(projRes.data.projects);
        setUsers(userRes.data.users);
      } catch {
        setProjects([]);
        setUsers([]);
      }
    };
    loadData();
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setForm({
        title: '',
        description: '',
        project: projectId || '',
        assignedTo: '',
        status: 'todo',
        priority: 'medium',
        dueDate: ''
      });
    }
  }, [task, isOpen, projectId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project) {
      toast.error('Title and project are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;

      await onSubmit(payload);
      toast.success(task ? 'Task updated successfully' : 'Task created successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(36,31,33,0.6)]" />
      <div
        className="relative w-full max-w-lg glass rounded-[20px] p-8 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne text-2xl font-bold text-[var(--color-text-primary)]">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-2 rounded-[99px] text-[var(--color-text-muted)] hover:bg-[var(--color-pill-bg)] hover:text-[var(--color-text-primary)] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors"
              placeholder="Enter task title"
              id="task-title-input"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors resize-none"
              placeholder="Describe the task"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Project</label>
              <select
                name="project"
                value={form.project}
                onChange={handleChange}
                className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Assign To</label>
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors"
              >
                <option value="todo">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-[99px] text-[14px] font-medium text-[var(--color-text-primary)] bg-[var(--color-pill-bg)] hover:bg-[var(--color-border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-[99px] text-[15px] font-syne font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
              id="task-submit-btn"
            >
              {submitting ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}