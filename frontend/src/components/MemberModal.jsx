import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MemberModal({ isOpen, onClose, project, onMemberAdded, onMemberRemoved }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data.users);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, [isOpen]);

  const memberIds = project?.members?.map((m) => m._id || m) || [];

  const addMember = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/projects/${project._id}/members`, { userId });
      onMemberAdded(data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.delete(`/projects/${project._id}/members/${userId}`);
      onMemberRemoved(data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(36,31,33,0.6)]" />
      <div
        className="relative w-full max-w-md glass rounded-[20px] p-8 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne text-2xl font-bold text-[var(--color-text-primary)]">Manage Members</h2>
          <button onClick={onClose} className="p-2 rounded-[99px] text-[var(--color-text-muted)] hover:bg-[var(--color-pill-bg)] hover:text-[var(--color-text-primary)] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-[12px] bg-[#FFD1D1] border border-[#7A1D1D]/10 text-[#7A1D1D] text-[13px] font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {users.map((u) => {
            const isMember = memberIds.includes(u._id);
            return (
              <div key={u._id} className="flex items-center justify-between p-4 rounded-[16px] bg-[var(--color-base)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[99px] bg-[var(--color-pill-bg)] flex items-center justify-center text-[var(--color-text-primary)] text-[12px] font-bold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{u.name}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => isMember ? removeMember(u._id) : addMember(u._id)}
                  disabled={loading}
                  className={`px-4 py-1.5 rounded-[99px] text-[12px] font-bold transition-all disabled:opacity-50 ${
                    isMember
                      ? 'bg-[#FFD1D1] text-[#7A1D1D] hover:bg-[#ffbebe]'
                      : 'bg-[var(--color-pill-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  {isMember ? 'Remove' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
