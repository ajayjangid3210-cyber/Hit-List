import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { isOverdue } from '../utils/formatDate';

function getInitials(n='') { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

function StatCard({ label, sub, value, iconBg, iconColor, Icon }) {
  return (
    <div className="card" style={{ padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <p style={{ color:'var(--color-text-muted)', fontSize:'14px', fontWeight:500 }}>{label}</p>
          <p className="font-syne" style={{ color:'var(--color-text-primary)', fontSize:'40px', fontWeight:800, marginTop:'8px', lineHeight:1.1 }}>{value??0}</p>
          <p style={{ color:'var(--color-text-muted)', fontSize:'13px', marginTop:'6px' }}>{sub}</p>
        </div>
        <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={24} color={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/projects')])
      .then(([tr, pr]) => { setTasks(tr.data.tasks||[]); setProjects(pr.data.projects||[]); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t=>t.status==='done').length;
    const inProgress = tasks.filter(t=>t.status==='in-progress').length;
    const todo = tasks.filter(t=>t.status==='todo').length;
    const overdue = tasks.filter(t=>isOverdue(t.dueDate,t.status)).length;
    return { total, completed, inProgress, todo, overdue };
  }, [tasks]);

  const projectStats = useMemo(() => {
    return projects.map(p => {
      const pt = tasks.filter(t => (t.project?._id||t.project)===p._id);
      const done = pt.filter(t=>t.status==='done').length;
      return { name: p.title, total: pt.length, done };
    });
  }, [tasks, projects]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(t => isOverdue(t.dueDate,t.status)).map(t => {
      const days = Math.ceil((new Date()-new Date(t.dueDate))/(1000*60*60*24));
      return { ...t, daysOverdue: days };
    });
  }, [tasks]);

  if (loading) return (
    <div className="page-enter">
      <h1 className="font-syne" style={{color:'var(--color-text-primary)',fontSize:'32px',fontWeight:800,marginBottom:'32px'}}>Reports</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'32px'}}>
        {[1,2,3,4].map(i=><Skeleton key={i} className="h-[130px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px]"/>)}
      </div>
      <Skeleton className="h-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px] mb-6" />
    </div>
  );

  const pct = (n) => stats.total > 0 ? Math.round(n/stats.total*100) : 0;

  return (
    <div className="page-enter">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
        <div>
          <h1 className="font-syne" style={{color:'var(--color-text-primary)',fontSize:'32px',fontWeight:800}}>Reports</h1>
          <p style={{color:'var(--color-text-muted)',fontSize:'15px',marginTop:'6px'}}>Project and task analytics</p>
        </div>
        <span style={{background:'var(--color-pill-bg)',border:'1px solid var(--color-border)',borderRadius:'99px',padding:'8px 16px',color:'var(--color-text-primary)',fontSize:'14px',fontWeight:600}}>All time</span>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'32px'}}>
        <StatCard label="Total Tasks" sub="All tasks" value={stats.total} iconBg="var(--color-pill-bg)" iconColor="var(--color-text-primary)" Icon={ClipboardList}/>
        <StatCard label="Completed" sub="Tasks done" value={stats.completed} iconBg="var(--color-pill-bg)" iconColor="var(--color-text-primary)" Icon={CheckCircle2}/>
        <StatCard label="In Progress" sub="Active tasks" value={stats.inProgress} iconBg="var(--color-accent)" iconColor="var(--color-text-primary)" Icon={Clock}/>
        <StatCard label="Overdue" sub="Past due" value={stats.overdue} iconBg="#FFD1D1" iconColor="#7A1D1D" Icon={AlertTriangle}/>
      </div>

      {/* Status breakdown */}
      <div className="card" style={{padding:'32px',marginBottom:'32px'}}>
        <h2 className="font-syne" style={{color:'var(--color-text-primary)',fontWeight:800,fontSize:'20px',marginBottom:'24px'}}>Task Status Breakdown</h2>
        {[{label:'To Do',count:stats.todo,color:'var(--color-text-muted)'},{label:'In Progress',count:stats.inProgress,color:'var(--color-accent)'},{label:'Done',count:stats.completed,color:'var(--color-text-primary)'}].map(s=>(
          <div key={s.label} style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
            <span style={{color:'var(--color-text-muted)',fontSize:'14px',fontWeight:500,width:'96px'}}>{s.label}</span>
            <div style={{flex:1,background:'var(--color-pill-bg)',borderRadius:'99px',height:'10px',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:'99px',background:s.color,width:`${pct(s.count)}%`,transition:'width 0.5s'}}/>
            </div>
            <span style={{color:'var(--color-text-primary)',fontSize:'14px',fontWeight:600,width:'40px',textAlign:'right'}}>{pct(s.count)}%</span>
          </div>
        ))}
      </div>

      {/* Tasks per project */}
      <div style={{marginBottom:'32px'}}>
        <h2 className="font-syne" style={{color:'var(--color-text-primary)',fontWeight:800,fontSize:'20px',marginBottom:'20px'}}>Tasks Per Project</h2>
        {projectStats.map(p=>(
          <div key={p.name} className="card" style={{padding:'20px 24px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{color:'var(--color-text-primary)',fontSize:'15px',fontWeight:600,width:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
            <div style={{flex:1,background:'var(--color-pill-bg)',borderRadius:'99px',height:'12px',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:'99px',background:'var(--color-text-primary)',width:p.total>0?`${p.done/p.total*100}%`:'0%',transition:'width 0.5s'}}/>
            </div>
            <span style={{color:'var(--color-text-muted)',fontSize:'14px',fontWeight:500,width:'100px',textAlign:'right'}}><span style={{color:'var(--color-text-primary)',fontWeight:700}}>{p.done}</span> / {p.total} tasks</span>
          </div>
        ))}
      </div>

      {/* Overdue tasks table */}
      <div className="card" style={{overflow:'hidden',padding:'0'}}>
        <div style={{padding:'24px'}}><h2 className="font-syne" style={{color:'var(--color-text-primary)',fontWeight:800,fontSize:'20px'}}>Overdue Tasks</h2></div>
        {overdueTasks.length===0 ? (
          <p style={{color:'var(--color-text-muted)',padding:'16px 24px 32px',fontSize:'15px',fontWeight:500,textAlign:'center'}}>No overdue tasks 🎉</p>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'var(--color-pill-bg)',borderTop:'1px solid var(--color-border)',borderBottom:'1px solid var(--color-border)'}}>
              {['Task','Project','Assigned To','Due Date','Days Overdue'].map(c=><th key={c} style={{padding:'14px 24px',color:'var(--color-text-muted)',fontSize:'13px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left'}}>{c}</th>)}
            </tr></thead>
            <tbody>
              {overdueTasks.map((t, idx)=>(
                <tr key={t._id} style={{borderBottom: idx === overdueTasks.length - 1 ? 'none' : '1px solid var(--color-border)'}} className="hover:bg-[var(--color-base)] transition-colors cursor-default">
                  <td style={{padding:'16px 24px',color:'var(--color-text-primary)',fontSize:'14px',fontWeight:600}}>{t.title}</td>
                  <td style={{padding:'16px 24px',color:'var(--color-text-muted)',fontSize:'14px'}}>{t.project?.title||'—'}</td>
                  <td style={{padding:'16px 24px'}}>
                    {t.assignedTo ? (
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'99px',background:'var(--color-pill-bg)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-primary)',fontSize:'11px',fontWeight:700}}>{getInitials(t.assignedTo.name)}</div>
                        <span style={{color:'var(--color-text-primary)',fontSize:'14px',fontWeight:500}}>{t.assignedTo.name}</span>
                      </div>
                    ) : <span style={{color:'var(--color-text-muted)',fontSize:'14px',fontStyle:'italic'}}>Unassigned</span>}
                  </td>
                  <td style={{padding:'16px 24px',color:'#7A1D1D',fontSize:'14px',fontWeight:600}}>{new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                  <td style={{padding:'16px 24px'}}><span style={{background:'#FFD1D1',color:'#7A1D1D',padding:'4px 12px',borderRadius:'99px',fontSize:'12px',fontWeight:700}}>{t.daysOverdue}d</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
