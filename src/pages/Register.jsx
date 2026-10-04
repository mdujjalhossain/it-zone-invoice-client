import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { User, Phone, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { AuthContext } from '../Contexts/AuthContext';

// Where to send an already signed-in user who opens this page (change to your real home route)
const DEFAULT_REDIRECT = '/';

const API = 'https://it-zone-invoice-server.vercel.app';

const swalBase = { background: '#111827', color: '#fff', confirmButtonColor: '#2563eb' };

// At least 8 characters, one uppercase, one lowercase, one number
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

// Shared style tokens (same look as ServiceTracking / Ledger)
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

// Defined outside the Register component so it isn't re-created on every render
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

const emptyForm = { name: '', phone: '', email: '', password: '', confirmPassword: '' };

export default function Register() {
  useEffect(() => {
    document.title = 'IT Zone-Inventory | Register';
  }, []);

  const { createUser, updateUserProfile, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || DEFAULT_REDIRECT;

  const [form, setForm] = useState(emptyForm);
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

  // Already signed in. "busy" keeps us here while the sign-up flow is still running
  // (Firebase signs the new user in first; we show the success message and then move on).
  if (user && !busy) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  // Create account with email & password
  const handleRegister = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !phone || !email || !form.password || !form.confirmPassword) {
      setErrorMsg('Please fill out all required fields!');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      setErrorMsg('Enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).');
      return;
    }
    if (!passwordRegex.test(form.password)) {
      setErrorMsg('Password must be at least 8 characters and include an uppercase letter, a lowercase letter and a number.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setBusy(true);
    setErrorMsg('');
    
    try {
      // 1. Firebase Authentication Create User
      await createUser(email, form.password);
      await updateUserProfile(name, null);

      // 2. Save the user in MongoDB Database via Backend API
      const dbResponse = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          name, 
          email, 
          phone, 
          photoURL: '' 
        })
      });

      const dbResult = await dbResponse.json();
      
      if (!dbResponse.ok) {
        console.error('Database failed to save user:', dbResult);
        throw new Error(dbResult.error || 'Failed to save user info to database.');
      } else {
        console.log('User successfully saved to database:', dbResult);
      }

      setForm(emptyForm);
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `Welcome, ${name}! Your account has been created successfully.`,
        ...swalBase
      });
      
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setErrorMsg(
              <span>
                This email is already registered. Please{' '}
                <Link to="/login" className="text-blue-400 font-semibold underline hover:text-blue-300">
                  Login
                </Link>{' '}
                instead.
              </span>
            );
            break;
          case 'auth/invalid-email':
            setErrorMsg('Enter a valid email address.');
            break;
          case 'auth/weak-password':
            setErrorMsg('Password is too weak. Please choose a stronger one.');
            break;
          case 'auth/network-request-failed':
            setErrorMsg('Network error occurred. Check your connection and try again.');
            break;
          default:
            setErrorMsg(err.message || 'Registration failed. Please try again.');
        }
      } else {
        setErrorMsg(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className={`w-full max-w-lg overflow-hidden ${ui.card}`}>

        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/50">
          <span className={ui.eyebrow}>Create Account</span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Register as Admin or Staff</h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in your details to start managing stock, invoices and services.
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" icon={User} required>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="e.g. Rahim Ahmed"
                value={form.name}
                onChange={handleChange}
                className={`${ui.input} pl-10 pr-4`}
              />
            </Field>

            <Field label="Phone Number" icon={Phone} required>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="017XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                className={`${ui.input} pl-10 pr-4`}
              />
            </Field>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password" icon={Lock} required>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
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

            <Field label="Confirm Password" icon={Lock} required>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`${ui.input} pl-10 pr-4`}
              />
            </Field>
          </div>
          <p className="text-[11px] text-gray-500 -mt-2">
            Use at least 8 characters with an uppercase letter, a lowercase letter and a number.
          </p>

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <button type="submit" disabled={busy} className={ui.btnPrimary}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {busy ? 'Please wait...' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-all">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}