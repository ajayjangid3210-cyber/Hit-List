import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ListChecks, Crown, User, Mail, Lock, EyeOff, Eye } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleRoleClick = (role) => {
    setActiveRole(role);
    if (role === 'admin') {
      setEmail('admin@test.com');
      setPassword('Admin@123456');
    } else {
      setEmail('member@test.com');
      setPassword('Member@123456');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--color-base)] overflow-hidden flex items-center justify-center p-4">
      {/* Glass Card - now solid Floema Card */}
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

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-syne text-[32px] font-bold text-[var(--color-text-primary)] mb-2">Welcome Back</h2>
          <p className="text-[var(--color-text-muted)] text-[15px]">Sign in to continue to your account</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2 mb-8 bg-[var(--color-pill-bg)] rounded-[99px] p-1.5">
          <button
            type="button"
            onClick={() => handleRoleClick('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[99px] text-[14px] transition-all duration-200 ${
              activeRole === 'admin' 
                ? 'font-bold text-[var(--color-base)] bg-[var(--color-text-primary)]' 
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
            }`}
          >
            <Crown size={18} /> Admin
          </button>
          
          <button
            type="button"
            onClick={() => handleRoleClick('member')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[99px] text-[14px] transition-all duration-200 ${
              activeRole === 'member' 
                ? 'font-bold text-[var(--color-base)] bg-[var(--color-text-primary)]' 
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
            }`}
          >
            <User size={18} /> Member
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="relative group focus-within:border-[var(--color-text-primary)] transition-all duration-200 bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail className="w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-text-primary)] transition-colors" />
            </div>
            <label htmlFor="email" className="block text-[var(--color-text-muted)] text-[12px] mb-1 pl-8 font-medium">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-[var(--color-text-primary)] text-[15px] outline-none placeholder:text-[var(--color-text-muted)] pl-8"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative group focus-within:border-[var(--color-text-primary)] transition-all duration-200 bg-[var(--color-base)] border border-[var(--color-border)] rounded-[12px] px-4 py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-text-primary)] transition-colors" />
            </div>
            <label htmlFor="password" className="block text-[var(--color-text-muted)] text-[12px] mb-1 pl-8 font-medium">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-[var(--color-text-primary)] text-[15px] outline-none placeholder:text-[var(--color-text-muted)] pl-8 pr-8"
              placeholder="••••••••"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && <div className="mt-2 text-[var(--color-danger)] text-[14px] text-center font-medium bg-[#FFD1D1] py-3 rounded-[12px]">{error}</div>}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 rounded-[99px] text-[var(--color-text-primary)] font-syne font-bold text-[16px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Bottom Link */}
          <div className="mt-6 text-center pt-6 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] text-[14px]">Don&apos;t have an account? </span>
            <Link to="/register" className="text-[var(--color-text-primary)] font-bold text-[14px] hover:underline underline-offset-4">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
