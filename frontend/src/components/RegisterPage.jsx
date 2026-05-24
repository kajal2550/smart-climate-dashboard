import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WiDaySunny } from 'react-icons/wi';
import {
  MdPerson, MdEmail, MdPhone, MdLock, MdVisibility,
  MdVisibilityOff, MdArrowForward, MdCheckCircle,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const BENEFITS = [
  'Real-time climate data from 8+ cities',
  'Live AQI & weather alerts',
  'Historical analytics & trend charts',
  'Export data as CSV or PDF',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [success, setSuccess]   = useState(false);

  const change = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name     = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(form.email))           e.email    = 'Enter a valid email';
    if (!/^\d{10}$/.test(form.phone))               e.phone    = 'Enter a valid 10-digit number';
    if (form.password.length < 6)                   e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)             e.confirm  = 'Passwords do not match';
    if (!agreed)                                    e.agreed   = 'You must agree to the terms';
    return e;
  };

  const submit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      login({ name: form.name, email: form.email, phone: form.phone });
      setLoading(false);
      setSuccess(true);
    }, 1400);
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
            Monitor India's Climate<br />Intelligence Platform
          </h2>
          <p className="auth-left-desc">
            Register today and get access to live climate data, air quality
            monitoring, and smart alerts — completely free.
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
          {success ? (
            <div className="auth-success">
              <MdCheckCircle className="auth-success-icon" />
              <h3>Account Created!</h3>
              <p>Welcome to ClimateWatch, <strong>{form.name}</strong>.</p>
              <button className="auth-btn" onClick={() => navigate('/dashboard')}>
                Go to Dashboard <MdArrowForward />
              </button>            </div>
          ) : (
            <>
              <h2 className="auth-card-title">Create Account</h2>
              <p className="auth-card-sub">Fill in your details to get started</p>

              <form className="auth-form" onSubmit={submit} noValidate>
                {/* Full Name */}
                <div className={`auth-field ${errors.name ? 'has-error' : ''}`}>
                  <label>Full Name</label>
                  <div className="auth-input-wrap">
                    <MdPerson className="auth-input-icon" />
                    <input name="name" value={form.name} onChange={change} placeholder="Your full name" />
                  </div>
                  {errors.name && <span className="auth-error">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <MdEmail className="auth-input-icon" />
                    <input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className={`auth-field ${errors.phone ? 'has-error' : ''}`}>
                  <label>Phone Number</label>
                  <div className="auth-input-wrap">
                    <MdPhone className="auth-input-icon" />
                    <input type="tel" name="phone" value={form.phone} onChange={change} placeholder="10-digit mobile number" maxLength={10} />
                  </div>
                  {errors.phone && <span className="auth-error">{errors.phone}</span>}
                </div>

                {/* Password */}
                <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                  <label>Password</label>
                  <div className="auth-input-wrap">
                    <MdLock className="auth-input-icon" />
                    <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={change} placeholder="Min. 6 characters" />
                    <button type="button" className="auth-eye" onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div className={`auth-field ${errors.confirm ? 'has-error' : ''}`}>
                  <label>Confirm Password</label>
                  <div className="auth-input-wrap">
                    <MdLock className="auth-input-icon" />
                    <input type={showCfm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={change} placeholder="Re-enter password" />
                    <button type="button" className="auth-eye" onClick={() => setShowCfm(v => !v)}>
                      {showCfm ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                  {errors.confirm && <span className="auth-error">{errors.confirm}</span>}
                </div>

                {/* Terms */}
                <div className={`auth-terms ${errors.agreed ? 'has-error' : ''}`}>
                  <label className="auth-checkbox">
                    <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: '' })); }} />
                    <span className="auth-checkmark" />
                    I agree to the <Link to="/contact" className="auth-link">Terms of Service</Link> and <Link to="/contact" className="auth-link">Privacy Policy</Link>
                  </label>
                  {errors.agreed && <span className="auth-error">{errors.agreed}</span>}
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : <><span>Create Account</span> <MdArrowForward /></>}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account? <Link to="/login" className="auth-link auth-link--bold">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
