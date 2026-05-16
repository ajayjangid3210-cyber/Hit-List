import { formatDate } from '../utils/formatDate';

export default function ProjectCard({ project, onClick, tasks = [] }) {
  const projectTasks = tasks.filter(t => t.project === project._id || t.project?._id === project._id);
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const displayMembers = project.members?.slice(0, 3) || [];
  const extraMembers = Math.max(0, (project.members?.length || 0) - 3);

  // Pick a subtle nature-inspired hover color based on the project ID length or character
  const hoverColors = ['#F5F7EC', '#FDF8EC', '#F4F7FC', '#FCF4F4'];
  const charCode = project._id ? project._id.charCodeAt(project._id.length - 1) : 0;
  const hoverColor = hoverColors[charCode % hoverColors.length];

  return (
    <div
      onClick={() => onClick(project._id)}
      className="card p-6 cursor-pointer group"
      style={{ '--hover-bg': hoverColor }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverColor}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
    >
      <h3 className="font-syne text-xl font-bold text-[var(--color-text-primary)] mb-2 transition-colors">{project.title}</h3>
      {project.description && (
        <p className="text-[14px] text-[var(--color-text-muted)] mb-6 line-clamp-2 leading-relaxed">{project.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[12px] font-medium mb-2">
          <span className="text-[var(--color-text-muted)] uppercase tracking-wider">Progress</span>
          <span className="text-[var(--color-text-primary)] font-semibold">{completedTasks}/{totalTasks} tasks</span>
        </div>
        <div className="w-full bg-[var(--color-pill-bg)] rounded-[99px] h-[3px] overflow-hidden">
          <div 
            className="h-full rounded-[99px] transition-all duration-[0.6s] ease-in-out bg-[var(--color-text-primary)]" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-auto">
        <div className="flex items-center">
          {displayMembers.map((m, i) => (
            <div key={m._id} className={`w-8 h-8 rounded-[99px] bg-[var(--color-base)] flex items-center justify-center text-[var(--color-text-primary)] text-[11px] font-bold border-2 border-[var(--color-surface)] ${i > 0 ? '-ml-3' : ''} shadow-sm group-hover:border-[${hoverColor}]`} style={{ zIndex: 3-i }}>
              {m.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {extraMembers > 0 && (
            <div className="w-8 h-8 rounded-[99px] bg-[var(--color-pill-bg)] flex items-center justify-center text-[var(--color-text-primary)] text-[11px] font-bold border-2 border-[var(--color-surface)] -ml-3 shadow-sm group-hover:border-[${hoverColor}]" style={{ zIndex: 0 }}>
              +{extraMembers}
            </div>
          )}
        </div>
        <span className="text-[12px] text-[var(--color-text-muted)] font-medium bg-[var(--color-pill-bg)] px-3 py-1 rounded-[99px]">
          {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  );
}
