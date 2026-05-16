import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/roleGuard';
import api from '../api/axios';
import Skeleton from '../components/Skeleton';

function getInitials(n='') { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Try admin endpoint first, fallback to infer from projects
        let users = [];
        if (isAdmin(user)) {
          const { data } = await api.get('/users');
          users = data.users || [];
        } else {
          // Members can see themselves
          users = user ? [user] : [];
        }
        setMembers(users);

        // Get task counts per user
        const { data: td } = await api.get('/tasks');
        const counts = {};
        (td.tasks || []).forEach(t => {
          const uid = t.assignedTo?._id || t.assignedTo;
          if (uid) counts[uid] = (counts[uid] || 0) + 1;
        });
        setTaskCounts(counts);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-syne" style={{ color: 'var(--color-text-primary)', fontSize: '32px', fontWeight: 800 }}>Team</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '6px' }}>Manage your team members</p>
        </div>
        {isAdmin(user) && (
          <button style={{
            padding: '12px 24px', background: 'var(--color-accent)', color: 'var(--color-text-primary)',
            fontSize: '14px', fontWeight: 700, borderRadius: '99px', border: 'none', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', transition: 'background 0.2s'
          }} className="hover:bg-[var(--color-accent-hover)]">+ Invite Member</button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
          {[1,2,3].map(i => <Skeleton key={i} className="h-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px]" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
          {members.map(m => (
            <div key={m._id} style={{
              background: 'var(--color-surface)', borderRadius: '20px', padding: '32px',
              border: '1px solid var(--color-border)', transition: 'transform 0.2s',
              textAlign: 'center',
            }} className="hover:-translate-y-1">
              {/* Avatar */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '99px', margin: '0 auto',
                background: 'var(--color-pill-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: 700,
              }}>{getInitials(m.name)}</div>

              <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '18px', marginTop: '16px' }}>{m.name}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>{m.email}</p>

              {/* Role badge */}
              <div style={{ marginTop: '12px' }}>
                <span style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                  background: m.role === 'admin' ? 'var(--color-text-primary)' : 'var(--color-pill-bg)',
                  color: m.role === 'admin' ? 'var(--color-base)' : 'var(--color-text-primary)',
                }}>{m.role === 'admin' ? 'Admin' : 'Member'}</span>
              </div>

              {/* Task count */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Tasks assigned: <span style={{color:'var(--color-text-primary)', fontWeight:700}}>{taskCounts[m._id] || 0}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
