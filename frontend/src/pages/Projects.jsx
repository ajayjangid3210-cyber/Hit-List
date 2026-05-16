import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { isAdmin } from '../utils/roleGuard';
import ProjectCard from '../components/ProjectCard';
import Skeleton from '../components/Skeleton';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tasks, fetchTasks } = useTasks();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/projects', form);
      setForm({ title: '', description: '' });
      setShowForm(false);
      fetchProjects();
      toast.success('Project created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-syne text-[32px] font-bold text-[var(--color-text-primary)] tracking-tight">Projects</h1>
          <p className="text-[var(--color-text-muted)] text-[15px] mt-1.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin(user) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-primary)] text-[15px] font-syne font-bold rounded-[99px] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-8 mb-10 animate-[fadeIn_0.3s_ease_forwards]">
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Project Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)] transition-all"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-primary)] mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)] transition-all resize-none"
                placeholder="Describe the project"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-[99px] text-[14px] font-medium text-[var(--color-text-primary)] bg-[var(--color-pill-bg)] hover:bg-[var(--color-border)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-[99px] text-[15px] font-syne font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-primary)] transition-all disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[20px] bg-[var(--color-surface)] border border-[var(--color-border)]" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-[var(--color-pill-bg)] flex items-center justify-center">
            <svg className="w-12 h-12 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="font-syne text-2xl font-bold text-[var(--color-text-primary)] mb-2">No projects yet</h2>
          <p className="text-[var(--color-text-muted)] text-[14px] mb-8 max-w-sm">Create your first project to get started and collaborate with your team.</p>
          {isAdmin(user) && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-primary)] text-[15px] font-syne font-bold rounded-[99px] transition-all hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              tasks={tasks}
              onClick={(id) => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
