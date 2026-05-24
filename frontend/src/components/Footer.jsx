import React from 'react';
import { Link } from 'react-router-dom';
import { WiDaySunny } from 'react-icons/wi';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { MdLocationOn, MdPhone, MdEmail } from 'react-icons/md';
import './Footer.css';

const QUICK_LINKS = [
  { to: '/',          label: 'Home'        },
  { to: '/dashboard', label: 'Dashboard'   },
  { to: '/sensors',   label: 'Sensors'     },
  { to: '/alerts',    label: 'Alerts'      },
  { to: '/map',       label: 'Map View'    },
  { to: '/analytics', label: 'Analytics'   },
];

const RESOURCES = [
  { to: '/contact',  label: 'About Us'     },
  { to: '/contact',  label: 'Contact Us'   },
  { to: '/login',    label: 'Login'        },
  { to: '/register', label: 'Register'     },
  { to: '/contact',  label: 'Privacy Policy' },
  { to: '/contact',  label: 'Terms of Use' },
];

const SOCIALS = [
  { icon: <FaGithub />,   href: '#', label: 'GitHub'   },
  { icon: <FaTwitter />,  href: '#', label: 'Twitter'  },
  { icon: <FaLinkedin />, href: '#', label: 'LinkedIn' },
  { icon: <FaInstagram />,href: '#', label: 'Instagram'},
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* ── Brand col ──────────────────────────────── */}
        <div className="footer-brand-col">
          <div className="footer-brand">
            <span className="footer-logo"><WiDaySunny /></span>
            <div>
              <p className="footer-brand-name">ClimateWatch</p>
              <p className="footer-brand-sub">Smart Monitoring Dashboard</p>
            </div>
          </div>
          <p className="footer-desc">
            India's real-time climate intelligence platform — connecting
            citizens with live weather data, air quality monitoring, and
            smart environmental alerts across major cities.
          </p>
          <div className="footer-socials">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} className="footer-social" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick Links ────────────────────────────── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            {QUICK_LINKS.map(l => (
              <li key={l.label}>
                <Link to={l.to} className="footer-link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Resources ──────────────────────────────── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Resources</h4>
          <ul className="footer-links">
            {RESOURCES.map(l => (
              <li key={l.label}>
                <Link to={l.to} className="footer-link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact ────────────────────────────────── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact Us</h4>
          <ul className="footer-contact-list">
            <li>
              <MdLocationOn className="footer-contact-icon" />
              <span>ClimateWatch HQ,<br />Bengaluru, Karnataka 560001</span>
            </li>
            <li>
              <MdPhone className="footer-contact-icon" />
              <span>+91 98765 43210</span>
            </li>
            <li>
              <MdEmail className="footer-contact-icon" />
              <span>support@climatewatch.in</span>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ─────────────────────────────────── */}
      <div className="footer-bottom">
        <p className="footer-copy">
          © {new Date().getFullYear()} ClimateWatch · All rights reserved.
        </p>
        <div className="footer-bottom-links">
          <Link to="/contact" className="footer-bottom-link">Privacy Policy</Link>
          <Link to="/contact" className="footer-bottom-link">Terms of Use</Link>
          <Link to="/contact" className="footer-bottom-link">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
