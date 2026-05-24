import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WiDaySunny } from 'react-icons/wi';
import {
  MdEmail, MdLock, MdVisibility, MdVisibilityOff,
  MdArrowForward, MdCheckCircle,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const BENEFITS = [
  'Real-time climate data from 8+ cities',
  'Live AQI & weather alerts',
  'Historical analytics & trend charts',
  'Export data as CSV or PDF',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const change = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email';
    if (!form.password)                    e.password = 'Password is required';
    return e;
  };

  const submit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      // Derive name from email prefix
      const name = form.email.split('@')[0].replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      login({ name, email: form.email });
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  const guestLogin = () => {
    login({ name: 'Guest User', email: 'guest@climatewatch.in' });
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ─────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <span className="auth-brand-icon"><WiDaySunny /></span>
            <p className="auth-brand-name">ClimateWatch</p>
            <p className="auth-brand-sub">Smart Monitoring Dashboard</p>
          </div>
          <h2 className="auth-left-title">
            Welcome Back to<br />ClimateWatch
          </h2>
          <p className="auth-left-desc">
            Sign in to access live climate data, real-time alerts, and
            historical analytics for India's major cities.
          </p>
          <ul className="auth-benefits">
            {BENEFITS.map(b => (
              <li key={b}><MdCheckCircle className="benefit-check" />{b}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card-title">Sign In</h2>
          <p className="auth-card-sub">Enter your credentials to continue</p>

          <form className="auth-form" onSubmit={submit} noValidate>
            {/* Email */}
            <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <MdEmail className="auth-input-icon" />
                <input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" />
              </div>
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
              <label>
                Password
                <Link to="/contact" className="auth-link auth-forgot">Forgot password?</Link>
              </label>
              <div className="auth-input-wrap">
                <MdLock className="auth-input-icon" />
                <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={change} placeholder="Your password" />
                <button type="button" className="auth-eye" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <><span>Sign In</span> <MdArrowForward /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider"><span>or continue as</span></div>

          <button className="auth-btn-ghost" onClick={guestLogin}>
            Guest — View Dashboard
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register" className="auth-link auth-link--bold">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
