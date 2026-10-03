import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Phone, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'https://it-zone-invoice-server.vercel.app';

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

  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  // Create account (POST)
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
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg('Enter a valid email address.');
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password: form.password })
      });
      const data = await res.json();

      if (data.success) {
        setForm(emptyForm);
        setErrorMsg('');
        await Swal.fire({
          title: 'Success!',
          text: 'Account created successfully.',
          icon: 'success',
          background: '#111827',
          color: '#fff',
          confirmButtonColor: '#2563eb',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/login');
      } else {
        setErrorMsg(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('Error registering user:', err);
      setErrorMsg('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className={`w-full max-w-lg overflow-hidden ${ui.card}`}>

        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/50">
          <span className={ui.eyebrow}>Create Account</span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Register for IT Zone Inventory</h1>
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

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <button type="submit" disabled={submitting} className={ui.btnPrimary}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}