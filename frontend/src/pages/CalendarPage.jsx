import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isOverdue } from '../utils/formatDate';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2,'0'); }
function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function sameDay(a,b) { return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState([]);

  useEffect(() => { api.get('/tasks').then(r => setTasks(r.data.tasks||[])).catch(()=>{}); }, []);

  const prev = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const taskMap = useMemo(() => {
    const m = {};
    tasks.forEach(t => { if(!t.dueDate) return; const k=dateKey(new Date(t.dueDate)); if(!m[k]) m[k]=[]; m[k].push(t); });
    return m;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const first = new Date(year,month,1);
    const sw = first.getDay();
    const dim = new Date(year,month+1,0).getDate();
    const dpm = new Date(year,month,0).getDate();
    const cells = [];
    for(let i=sw-1;i>=0;i--) cells.push({day:dpm-i,current:false,date:new Date(year,month-1,dpm-i)});
    for(let d=1;d<=dim;d++) cells.push({day:d,current:true,date:new Date(year,month,d)});
    const rem=42-cells.length;
    for(let d=1;d<=rem;d++) cells.push({day:d,current:false,date:new Date(year,month+1,d)});
    return cells;
  }, [year,month]);

  const upcoming = useMemo(() => tasks.filter(t=>t.dueDate).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,5), [tasks]);

  const navBtn = { background:'var(--color-pill-bg)', border:'1px solid var(--color-border)', borderRadius:'99px', padding:'8px 12px', cursor:'pointer', display:'flex' };

  return (
    <div className="page-enter">
      <div style={{marginBottom:'32px'}}>
        <h1 className="font-syne" style={{color:'var(--color-text-primary)',fontSize:'32px',fontWeight:800}}>Calendar</h1>
        <p style={{color:'var(--color-text-muted)',fontSize:'15px',marginTop:'6px'}}>Task deadlines overview</p>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <button onClick={prev} style={navBtn} className="hover:bg-[var(--color-border)]"><ChevronLeft size={18} color="var(--color-text-primary)"/></button>
        <span className="font-syne" style={{color:'var(--color-text-primary)',fontWeight:800,fontSize:'20px',minWidth:'180px',textAlign:'center'}}>{MONTHS[month]} {year}</span>
        <button onClick={next} style={navBtn} className="hover:bg-[var(--color-border)]"><ChevronRight size={18} color="var(--color-text-primary)"/></button>
      </div>

      <div style={{overflowX:'auto', paddingBottom:'8px'}}>
        <div style={{minWidth:'700px',background:'var(--color-surface)',borderRadius:'20px',overflow:'hidden',border:'1px solid var(--color-border)'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {DAYS.map(d=><div key={d} style={{padding:'14px 0',textAlign:'center',color:'var(--color-text-muted)',fontSize:'13px',textTransform:'uppercase',fontWeight:700,borderBottom:'1px solid var(--color-border)'}}>{d}</div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {calendarDays.map((cell,idx)=>{
            const k=dateKey(cell.date); const dt=taskMap[k]||[]; const isT=sameDay(cell.date,today);
            return (
              <div key={idx} style={{minHeight:'90px',padding:'8px',borderRight:'1px solid var(--color-border)',borderBottom:'1px solid var(--color-border)',background:isT?'var(--color-pill-bg)':'transparent',opacity:cell.current?1:0.3}}>
                <div style={{marginBottom:'6px'}}>
                  {isT ? <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'28px',height:'28px',borderRadius:'99px',background:'var(--color-text-primary)',color:'var(--color-base)',fontSize:'13px',fontWeight:700}}>{cell.day}</span>
                       : <span style={{color:'var(--color-text-primary)',fontSize:'14px',fontWeight:500,paddingLeft:'4px'}}>{cell.day}</span>}
                </div>
                {dt.slice(0,2).map(t=><div key={t._id} style={{background:'var(--color-accent)',color:'var(--color-text-primary)',fontSize:'11px',fontWeight:600,padding:'3px 8px',borderRadius:'99px',marginBottom:'4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>)}
                {dt.length>2 && <span style={{color:'var(--color-text-muted)',fontSize:'11px',fontWeight:500,paddingLeft:'4px'}}>+{dt.length-2} more</span>}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      <div style={{marginTop:'48px'}}>
        <h2 className="font-syne" style={{color:'var(--color-text-primary)',fontWeight:800,fontSize:'24px',marginBottom:'20px'}}>Upcoming Deadlines</h2>
        <div style={{overflowX:'auto'}}>
          <div style={{minWidth:'500px', background:'var(--color-surface)',borderRadius:'20px',overflow:'hidden',border:'1px solid var(--color-border)'}}>
          {upcoming.length===0 ? <p style={{color:'var(--color-text-muted)',padding:'32px',textAlign:'center',fontSize:'14px',fontWeight:500}}>No upcoming deadlines</p> :
            upcoming.map((t, idx)=>{
              const od=isOverdue(t.dueDate,t.status); const d=new Date(t.dueDate);
              const isLast = idx === upcoming.length - 1;
              return (
                <div key={t._id} style={{display:'flex',alignItems:'center',gap:'16px',padding:'16px 24px',borderBottom: isLast ? 'none' : '1px solid var(--color-border)'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:od?'#7A1D1D':t.status==='done'?'var(--color-text-muted)':'var(--color-accent)'}}/>
                  <span style={{color:'var(--color-text-primary)',fontSize:'14px',fontWeight:600,flex:1}}>{t.title}</span>
                  <span style={{color:'var(--color-text-muted)',fontSize:'13px',minWidth:'120px'}}>{t.project?.title||'—'}</span>
                  <span style={{fontSize:'13px',fontWeight:od?600:500,color:od?'#7A1D1D':'var(--color-text-muted)'}}>{d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                </div>
              );
            })
          }
          </div>
        </div>
      </div>
    </div>
  );
}
