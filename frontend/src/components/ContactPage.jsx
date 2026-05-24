import React, { useState } from 'react';
import {
  MdEmail, MdPhone, MdLocationOn, MdSend,
  MdCheckCircle, MdSupportAgent, MdBugReport, MdFeedback,
} from 'react-icons/md';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import './ContactPage.css';

const TOPICS = [
  { value: 'support',  label: 'Technical Support', icon: <MdSupportAgent /> },
  { value: 'bug',      label: 'Report a Bug',       icon: <MdBugReport />   },
  { value: 'feedback', label: 'Feedback',            icon: <MdFeedback />    },
  { value: 'other',    label: 'Other',               icon: <MdEmail />       },
];

const INFO_CARDS = [
  {
    icon: <MdEmail />, color: '#246BF2',
    title: 'Email Us',
    lines: ['support@climatewatch.in', 'data@climatewatch.in'],
  },
  {
    icon: <MdPhone />, color: '#10b981',
    title: 'Call Us',
    lines: ['+91 98765 43210', 'Mon–Fri, 9 AM – 6 PM IST'],
  },
  {
    icon: <MdLocationOn />, color: '#f97316',
    title: 'Our Office',
    lines: ['ClimateWatch HQ', 'Bengaluru, Karnataka 560001'],
  },
];

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', topic: 'support', message: '' });
  const [submitted, setSubmit] = useState(false);
  const [loading, setLoading]  = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    // Simulate submit
    setTimeout(() => { setLoading(false); setSubmit(true); }, 1200);
  };

  return (
    <div className="contact-page">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="contact-hero">
        <div className="contact-hero-bg" />
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>Have a question about ClimateWatch? We're here to help.</p>
        </div>
      </div>

      <div className="contact-body">

        {/* ── Info cards ───────────────────────────────────── */}
        <div className="contact-info-row">
          {INFO_CARDS.map(c => (
            <div className="contact-info-card" key={c.title}>
              <span className="ci-icon" style={{ color: c.color, background: c.color + '15' }}>{c.icon}</span>
              <div>
                <p className="ci-title">{c.title}</p>
                {c.lines.map(l => <p className="ci-line" key={l}>{l}</p>)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Form + FAQ ───────────────────────────────────── */}
        <div className="contact-main">

          {/* Form */}
          <div className="contact-form-wrap">
            <h2>Send a Message</h2>
            <p className="contact-form-sub">We'll get back to you within 24 hours.</p>

            {submitted ? (
              <div className="contact-success">
                <MdCheckCircle className="success-icon" />
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out. We'll reply to <strong>{form.email}</strong> shortly.</p>
                <button className="btn-reset" onClick={() => { setSubmit(false); setForm({ name:'', email:'', topic:'support', message:'' }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="Your name" required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com" required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Topic</label>
                  <div className="topic-grid">
                    {TOPICS.map(t => (
                      <label
                        key={t.value}
                        className={`topic-btn ${form.topic === t.value ? 'active' : ''}`}
                      >
                        <input
                          type="radio" name="topic" value={t.value}
                          checked={form.topic === t.value}
                          onChange={handleChange}
                          style={{ display: 'none' }}
                        />
                        <span className="topic-icon">{t.icon}</span>
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    placeholder="Describe your issue or question in detail…"
                    rows={5} required
                  />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-spinner" />
                  ) : (
                    <><MdSend /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div className="contact-faq">
            <h2>Frequently Asked</h2>
            <div className="faq-list">
              {[
                { q: 'How often is data updated?', a: 'Sensor data is pushed via WebSocket every ~5 seconds. Bulk syncs happen every 30 seconds.' },
                { q: 'Which cities are monitored?', a: 'Currently 8 major Indian cities: Bengaluru, Chennai, Hyderabad, Kolkata, Mumbai, New Delhi, Pune, and Ahmedabad.' },
                { q: 'What does the AQI scale mean?', a: '0–50 Good · 51–100 Moderate · 101–150 Unhealthy for Sensitive Groups · 151–200 Unhealthy · 201–300 Very Unhealthy · 301+ Hazardous.' },
                { q: 'Can I export the data?', a: 'Yes — use the Export button on the Dashboard or Sensors page to download CSV or PDF reports.' },
                { q: 'How do I acknowledge an alert?', a: 'Go to the Alerts page, find the alert, and click "Acknowledge" or "Resolve".' },
              ].map(({ q, a }) => (
                <FaqItem key={q} q={q} a={a} />
              ))}
            </div>

            {/* Social */}
            <div className="contact-social">
              <p>Follow us</p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="GitHub"><FaGithub /></a>
                <a href="#" className="social-link" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className="social-link" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(v => !v)}>
        {q}
        <span className="faq-arrow">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}
