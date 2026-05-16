import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ListChecks } from 'lucide-react';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--color-base)] overflow-hidden flex items-center justify-center p-4">
      <div 
        className="card w-full max-w-md mx-auto"
        style={{ padding: '60px 48px' }}
      >
        
        {/* App Icon */}
        <div 
          className="mx-auto mb-6 flex items-center justify-center bg-[var(--color-accent)]"
          style={{ width: '64px', height: '64px', borderRadius: '99px' }}
        >
          <ListChecks size={32} className="text-[var(--color-text-primary)]" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-syne text-[32px] font-bold text-[var(--color-text-primary)] mb-2">Create Account</h1>
          <p className="text-[var(--color-text-muted)] text-[15px]">Join your team to start collaborating</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-[var(--color-text-muted)] text-[12px] mb-1 font-medium pl-1">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[var(--color-text-primary)] text-[15px] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)] transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[var(--color-text-muted)] text-[12px] mb-1 font-medium pl-1">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[var(--color-text-primary)] text-[15px] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)] transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[var(--color-text-muted)] text-[12px] mb-1 font-medium pl-1">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[var(--color-text-primary)] text-[15px] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-[var(--color-text-muted)] text-[12px] mb-1 font-medium pl-1">Role</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 text-[var(--color-text-primary)] text-[15px] focus:outline-none focus:border-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="mt-2 text-[var(--color-danger)] text-[14px] text-center font-medium bg-[#FFD1D1] py-3 rounded-[12px]">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 rounded-[99px] text-[var(--color-text-primary)] font-syne font-bold text-[16px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-[var(--color-border)]">
          <span className="text-[var(--color-text-muted)] text-[14px]">Already have an account? </span>
          <Link to="/login" className="text-[var(--color-text-primary)] font-bold text-[14px] hover:underline underline-offset-4 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
