import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function getInitials(n='') { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

const inputStyle = {
  width: '100%', background: 'var(--color-base)', border: '1px solid var(--color-border)',
  borderRadius: '12px', padding: '12px 16px', color: 'var(--color-text-primary)', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function SettingsPage() {
  const { user, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteModal(false);
    }
  };

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await api.put(`/users/${user._id}`, { name });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPwError('');
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: curPw, newPassword: newPw });
      toast.success('Password updated');
      setCurPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
    setChangingPw(false);
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex' }}>
      {show ? <EyeOff size={16} color="var(--color-text-muted)"/> : <Eye size={16} color="var(--color-text-muted)"/>}
    </button>
  );

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '48px' }}>
        <h1 className="font-syne" style={{ color: 'var(--color-text-primary)', fontSize: '32px', fontWeight: 800 }}>Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '6px' }}>Manage your account</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Profile */}
        <div className="card" style={{ flex: 1, minWidth: '300px', padding: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '99px', margin: '0 auto',
              background: 'var(--color-pill-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-primary)', fontSize: '28px', fontWeight: 700,
            }}>{getInitials(user?.name)}</div>
            <p style={{ color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: 600, marginTop: '12px', cursor: 'pointer' }}>Change Avatar</p>
          </div>

          <div style={{ marginTop: '32px' }}>
            <label style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', paddingLeft: '4px' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <label style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', paddingLeft: '4px' }}>Email</label>
            <input value={user?.email || ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <label style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', paddingLeft: '4px' }}>Role</label>
            <input value={user?.role || ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed', textTransform: 'capitalize' }} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{
            marginTop: '24px', width: '100%', padding: '14px',
            background: 'var(--color-accent)', color: 'var(--color-text-primary)',
            fontWeight: 700, fontSize: '15px', borderRadius: '99px', border: 'none', cursor: 'pointer',
            opacity: saving ? 0.7 : 1, fontFamily: 'Syne, sans-serif'
          }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>

        {/* Security */}
        <div className="card" style={{ flex: 1, minWidth: '300px', padding: '32px' }}>
          <h2 className="font-syne" style={{ color: 'var(--color-text-primary)', fontWeight: 800, fontSize: '20px', marginBottom: '24px' }}>Change Password</h2>

          {['Current Password', 'New Password', 'Confirm New Password'].map((lbl, i) => {
            const val = [curPw, newPw, confirmPw][i];
            const setter = [setCurPw, setNewPw, setConfirmPw][i];
            const show = [showCur, showNew, showConfirm][i];
            const toggle = [() => setShowCur(!showCur), () => setShowNew(!showNew), () => setShowConfirm(!showConfirm)][i];
            return (
              <div key={lbl} style={{ marginTop: i === 0 ? 0 : '20px' }}>
                <label style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', paddingLeft: '4px' }}>{lbl}</label>
                <div style={{ position: 'relative' }}>
                  <input type={show ? 'text' : 'password'} value={val} onChange={e => setter(e.target.value)} style={{ ...inputStyle, paddingRight: '44px' }} />
                  {eyeBtn(show, toggle)}
                </div>
              </div>
            );
          })}

          {pwError && <p style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: 500, marginTop: '12px' }}>{pwError}</p>}

          <button onClick={handlePasswordChange} disabled={changingPw} style={{
            marginTop: '24px', width: '100%', padding: '14px',
            background: 'var(--color-accent)', color: 'var(--color-text-primary)',
            fontWeight: 700, fontSize: '15px', borderRadius: '99px', border: 'none', cursor: 'pointer',
            opacity: changingPw ? 0.7 : 1, fontFamily: 'Syne, sans-serif'
          }}>{changingPw ? 'Updating...' : 'Update Password'}</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        marginTop: '32px', background: '#FFD1D1', border: '1px solid rgba(122,29,29,0.2)',
        borderRadius: '20px', padding: '32px',
      }}>
        <h3 className="font-syne" style={{ color: '#7A1D1D', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Danger Zone</h3>
        <p style={{ color: '#7A1D1D', fontSize: '14px', marginBottom: '20px' }}>These actions are permanent and cannot be undone.</p>
        <button onClick={() => setShowDeleteModal(true)} style={{
          padding: '12px 24px', border: '1px solid #7A1D1D', borderRadius: '99px', fontWeight: 600,
          color: '#7A1D1D', fontSize: '14px', background: 'transparent', cursor: 'pointer',
          transition: 'background 0.15s',
        }} className="hover:bg-[#ffbebe]">Delete Account</button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(36,31,33,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowDeleteModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{
            padding: '32px', maxWidth: '400px', width: '90%',
          }}>
            <h3 className="font-syne" style={{ color: 'var(--color-text-primary)', fontWeight: 800, fontSize: '24px', marginBottom: '8px' }}>Are you sure?</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '24px' }}>This will permanently delete your account and all associated data.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{
                padding: '10px 24px', background: 'var(--color-pill-bg)', border: 'none',
                borderRadius: '99px', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{
                padding: '10px 24px', background: '#FFD1D1', border: 'none',
                borderRadius: '99px', color: '#7A1D1D', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              }}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
