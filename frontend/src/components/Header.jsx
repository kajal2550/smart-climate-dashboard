import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WiDaySunny, WiThermometer } from 'react-icons/wi';
import {
  MdHome, MdDashboard, MdSensors, MdNotifications,
  MdMap, MdBarChart, MdContactMail,
  MdMenu, MdClose, MdLogin, MdPersonAdd,
  MdDarkMode, MdLightMode, MdLogout,
  MdKeyboardArrowDown, MdCheckCircle,
  MdSpeed, MdAir,
} from 'react-icons/md';
import { useClimate } from '../context/ClimateContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/* ── 5 items in navbar (Dashboard → sidebar only) ───── */
const NAV_5 = [
  { path: '/',          label: 'Home',      },
  { path: '/sensors',   label: 'Sensors',   },
  { path: '/alerts',    label: 'Alerts',    },
  { path: '/analytics', label: 'Analytics', },
  { path: '/contact',   label: 'Contact',   },
];

/* ── All items in sidebar ────────────────────────────── */
const SIDEBAR_ITEMS = [
  { section: 'Main' },
  { path: '/',          label: 'Home',      icon: <MdHome />          },
  { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard />     },
  { section: 'Monitor' },
  { path: '/sensors',   label: 'Sensors',   icon: <MdSensors />       },
  { path: '/alerts',    label: 'Alerts',    icon: <MdNotifications /> },
  { path: '/map',       label: 'Map View',  icon: <MdMap />           },
  { path: '/analytics', label: 'Analytics', icon: <MdBarChart />      },
  { section: 'More' },
  { path: '/contact',   label: 'Contact',   icon: <MdContactMail />   },
];

function getAQIColor(aqi) {
  if (aqi <= 50)  return '#10b981';
  if (aqi <= 100) return '#f59e0b';
  if (aqi <= 150) return '#f97316';
  return '#ef4444';
}

export default function Header() {
  const { alertSummary = {}, connected = false, lastUpdate, liveEvents = [], readings = [] } = useClimate();
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);

  const criticalCount = alertSummary.critical || 0;
  const totalAlerts   = criticalCount + (alertSummary.warning || 0);

  /* close panels on outside click */
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (sidebarRef.current && !sidebarRef.current.contains(e.target) &&
          !e.target.closest('.hdr-hamburger')) setSidebarOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* lock body scroll when sidebar open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  /* notifications */
  const notifications = [
    ...(criticalCount > 0 ? [{ id: 'crit', type: 'critical',
      title: `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''} Active`,
      time: 'Now', icon: '🚨' }] : []),
    ...liveEvents.slice(0, 6).map((e, i) => ({
      id: e.id || i, type: e.type === 'alert' ? 'alert' : 'update',
      title: e.type === 'update'
        ? `${e.city} — ${e.temp?.toFixed(1)}°C · AQI ${Math.round(e.aqi || 0)}`
        : e.type === 'alert' ? `[${e.severity?.toUpperCase()}] ${e.title}`
        : e.message || 'System event',
      time: new Date(Math.floor(e.id)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: e.type === 'alert' ? '⚠️' : e.type === 'update' ? '📡' : '🔔',
    })),
  ];
  const unreadCount = notifications.length;

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const handleLogout = () => {
    logout(); setProfileOpen(false); setSidebarOpen(false); navigate('/');
  };
  const closeSidebar = () => setSidebarOpen(false);

  /* weather ticker items — duplicate for seamless loop */
  const tickerItems = readings.length > 0
    ? [...readings, ...readings]
    : [];

  return (
    <>
      <header className="hdr">
        {/* ── Main bar ──────────────────────────────────── */}
        <div className="hdr-inner">

          {/* Hamburger */}
          <button className="hdr-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Open menu">
            <span /><span /><span />
          </button>

          {/* Brand */}
          <Link to="/" className="hdr-brand">
            <span className="hdr-logo"><WiDaySunny /></span>
            <div>
              <p className="hdr-name">ClimateWatch</p>
              <p className="hdr-tagline">Smart Monitoring Dashboard</p>
            </div>
          </Link>

          {/* Centre nav — 5 items, no Dashboard */}
          <nav className="hdr-nav">
            {NAV_5.map(({ path, label }) => {
              const isActive  = location.pathname === path;
              const showBadge = path === '/alerts' && totalAlerts > 0;
              return (
                <Link key={path} to={path}
                  className={`hdr-link${isActive ? ' hdr-link--active' : ''}`}>
                  {label}
                  {showBadge && <span className="hdr-badge">{totalAlerts}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="hdr-right">

            {user ? (
              <>
                {/* Notification bell */}
                <div className="hdr-notif-wrap" ref={notifRef}>
                  <button className="hdr-icon-btn" aria-label="Notifications"
                    onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}>
                    <MdNotifications />
                    {unreadCount > 0 && <span className="hdr-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>
                  {notifOpen && (
                    <div className="hdr-notif-panel">
                      <div className="hdr-notif-header">
                        <span>Notifications</span>
                        {unreadCount > 0 && <span className="hdr-notif-count">{unreadCount} new</span>}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="hdr-notif-empty">
                          <MdCheckCircle style={{ fontSize: '2rem', color: '#10b981' }} />
                          <p>All clear</p>
                        </div>
                      ) : (
                        <div className="hdr-notif-list">
                          {notifications.map(n => (
                            <div key={n.id} className={`hdr-notif-item hdr-notif-item--${n.type}`}>
                              <span className="hdr-notif-icon">{n.icon}</span>
                              <div>
                                <p className="hdr-notif-title">{n.title}</p>
                                <p className="hdr-notif-time">{n.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link to="/alerts" className="hdr-notif-footer" onClick={() => setNotifOpen(false)}>
                        View all alerts →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Theme toggle */}
                <button className="hdr-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
                </button>

                {/* Profile */}
                <div className="hdr-profile-wrap" ref={profileRef}>
                  <button className="hdr-profile-btn"
                    onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}>
                    <span className="hdr-avatar">{initials}</span>
                    <span className="hdr-profile-name">{user.name.split(' ')[0]}</span>
                    <MdKeyboardArrowDown className={`hdr-arrow${profileOpen ? ' open' : ''}`} />
                  </button>
                  {profileOpen && (
                    <div className="hdr-dropdown">
                      <div className="hdr-drop-user">
                        <span className="hdr-avatar hdr-avatar--lg">{initials}</span>
                        <div>
                          <p className="hdr-drop-name">{user.name}</p>
                          <p className="hdr-drop-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="hdr-drop-divider" />
                      <Link to="/dashboard" className="hdr-drop-item" onClick={() => setProfileOpen(false)}><MdDashboard /> Dashboard</Link>
                      <Link to="/sensors"   className="hdr-drop-item" onClick={() => setProfileOpen(false)}><MdSensors /> My Sensors</Link>
                      <Link to="/alerts"    className="hdr-drop-item" onClick={() => setProfileOpen(false)}>
                        <MdNotifications /> Alerts
                        {totalAlerts > 0 && <span className="hdr-drop-badge">{totalAlerts}</span>}
                      </Link>
                      <div className="hdr-drop-divider" />
                      <button className="hdr-drop-item hdr-drop-item--danger" onClick={handleLogout}><MdLogout /> Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="hdr-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
                </button>
                <Link to="/login"    className="hdr-login">    <MdLogin />    Login    </Link>
                <Link to="/register" className="hdr-register"> <MdPersonAdd /> Register </Link>
              </>
            )}
          </div>
        </div>

        {/* ── NEW FEATURE: Live Weather Ticker ──────────── */}
        {tickerItems.length > 0 && (
          <div className="hdr-ticker">
            <span className="ticker-label">
              <span className="ticker-dot" />
              LIVE
            </span>
            <div className="ticker-track-wrap">
              <div className="ticker-track">
                {tickerItems.map((r, i) => {
                  const temp = r.temperature?.celsius;
                  const aqi  = r.airQualityIndex ?? 0;
                  const col  = getAQIColor(aqi);
                  const COND = { sunny:'☀️', cloudy:'☁️', 'partly-cloudy':'⛅', rainy:'🌧️', stormy:'⛈️', foggy:'🌫️', snowy:'❄️', windy:'💨' };
                  return (
                    <Link key={`${r.sensorId}-${i}`} to="/dashboard" className="ticker-item">
                      <span className="ticker-cond">{COND[r.condition] || '🌡️'}</span>
                      <span className="ticker-city">{r.location?.city}</span>
                      <span className="ticker-temp">{temp?.toFixed(1)}°C</span>
                      <span className="ticker-aqi" style={{ color: col }}>AQI {Math.round(aqi)}</span>
                      <span className="ticker-sep">·</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════
          SIDEBAR DRAWER
      ══════════════════════════════════════════════════ */}
      <div className={`sidebar-backdrop${sidebarOpen ? ' visible' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`} ref={sidebarRef}>
        <div className="sb-head">
          <div className="sb-brand">
            <span className="sb-logo"><WiDaySunny /></span>
            <div>
              <p className="sb-name">ClimateWatch</p>
              <p className="sb-sub">Smart Monitoring</p>
            </div>
          </div>
          <button className="sb-close" onClick={closeSidebar} aria-label="Close"><MdClose /></button>
        </div>

        {user && (
          <div className="sb-user">
            <span className="hdr-avatar hdr-avatar--lg">{initials}</span>
            <div>
              <p className="sb-user-name">{user.name}</p>
              <span className="sb-user-role">User</span>
            </div>
          </div>
        )}

        <nav className="sb-nav">
          {SIDEBAR_ITEMS.map((item, i) => {
            if (item.section) return <p key={i} className="sb-section">{item.section}</p>;
            const isActive  = location.pathname === item.path;
            const showBadge = item.path === '/alerts' && totalAlerts > 0;
            return (
              <Link key={item.path} to={item.path}
                className={`sb-link${isActive ? ' sb-link--active' : ''}`}
                onClick={closeSidebar}>
                <span className="sb-link-icon">{item.icon}</span>
                {item.label}
                {showBadge && <span className="sb-badge">{totalAlerts}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sb-footer">
          <button className="sb-theme-btn" onClick={toggleTheme}>
            {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          {user ? (
            <button className="sb-logout" onClick={handleLogout}><MdLogout /> Sign Out</button>
          ) : (
            <div className="sb-auth-btns">
              <Link to="/login"    className="sb-login-btn"    onClick={closeSidebar}><MdLogin />    Login</Link>
              <Link to="/register" className="sb-register-btn" onClick={closeSidebar}><MdPersonAdd /> Register</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
