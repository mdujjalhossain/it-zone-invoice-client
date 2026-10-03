import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { AuthContext } from '../Contexts/AuthContext';

// Where to go after login when the user didn't come from a protected page (change to your real home route)
const DEFAULT_REDIRECT = '/dashboard';

const swalBase = { background: '#111827', color: '#fff', confirmButtonColor: '#2563eb' };

// Shared style tokens (same look as ServiceTracking / Ledger / Register)
const ui = {
  card: 'bg-[#111827] border border-gray-800 rounded-2xl shadow-xl',
  input:
    'w-full bg-gray-900 border border-gray-800 rounded-xl py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all',
  label: 'block text-xs font-semibold text-gray-400 mb-1',
  eyebrow:
    'text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold',
  btnPrimary:
    'w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
};

// Defined outside the Login component so it isn't re-created on every render
const Field = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className={ui.label}>
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
        <Icon size={16} />
      </span>
      {children}
    </div>
  </div>
);

export default function Login() {
  useEffect(() => {
    document.title = 'IT Zone-Inventory | Login';
  }, []);

  const { signIn, resetPassword, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Send the user back to the page they were trying to open (set by a protected route), or to the default page
  const from = location.state?.from?.pathname || DEFAULT_REDIRECT;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // can hold text or a small JSX message
  const [busy, setBusy] = useState(false);

  // While the session is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className={`${ui.card} p-8 flex flex-col items-center gap-3`}>
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  // Already signed in. "busy" keeps us here while the sign-in flow is running.
  if (user && !busy) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  // Sign in with email & password
  const handleLogin = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) {
      setErrorMsg('Please enter your email and password!');
      return;
    }

    setBusy(true);
    setErrorMsg('');
    try {
      const result = await signIn(email, form.password);

      Swal.fire({
        icon: 'success',
        title: 'Sign-In Successful!',
        text: `Welcome back, ${result.user.displayName || 'there'}!`,
        timer: 1800,
        showConfirmButton: false,
        ...swalBase
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setErrorMsg(
            <span>
              Incorrect email or password. New here?{' '}
              <Link to="/register" className="text-blue-400 font-semibold underline hover:text-blue-300">
                Create an account
              </Link>
              .
            </span>
          );
          break;
        case 'auth/invalid-email':
          setErrorMsg('Enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setErrorMsg('Too many attempts. Please wait a moment or reset your password.');
          break;
        case 'auth/network-request-failed':
          setErrorMsg('Network error occurred. Check your connection and try again.');
          break;
        default:
          setErrorMsg('Sign-in failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  // Send a password reset email
  const handleForgotPassword = async () => {
    const email = form.email.trim().toLowerCase();

    if (!email) {
      Swal.fire({
        icon: 'info',
        title: 'Enter Your Email',
        text: 'Type your email address in the email field first, then click "Forgot password?".',
        ...swalBase
      });
      return;
    }

    try {
      await resetPassword(email);
      Swal.fire({
        icon: 'success',
        title: 'Check Your Inbox',
        text: `If an account exists for ${email}, a password reset link has been sent.`,
        ...swalBase
      });
    } catch (err) {
      console.error('Password reset error:', err);
      setErrorMsg(
        err.code === 'auth/invalid-email'
          ? 'Enter a valid email address.'
          : 'Could not send the reset email. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className={`w-full max-w-md overflow-hidden ${ui.card}`}>

        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/50">
          <span className={ui.eyebrow}>Welcome Back</span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Admin or Staff login</h1>
          <p className="text-sm text-gray-400 mt-1">
            Enter your details to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <Field label="Email Address" icon={Mail} required>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={`${ui.input} pl-10 pr-4`}
            />
          </Field>

          <div>
            <Field label="Password" icon={Lock} required>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={`${ui.input} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-all cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-all cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <button type="submit" disabled={busy} className={ui.btnPrimary}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {busy ? 'Please wait...' : 'Sign In'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-all">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}