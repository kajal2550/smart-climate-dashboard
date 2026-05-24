import React from 'react';
import { Link } from 'react-router-dom';
import { useClimate } from '../context/ClimateContext';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdSensors, MdNotifications, MdMap,
  MdBarChart, MdArrowForward, MdThermostat, MdAir,
  MdWater, MdSpeed, MdWifi, MdShield, MdAutoGraph,
  MdLocationOn, MdCheckCircle,
} from 'react-icons/md';
import { WiDaySunny, WiHumidity, WiStrongWind } from 'react-icons/wi';
import './HomePage.css';

function avg(readings, fn) {
  if (!readings.length) return 0;
  return readings.reduce((s, r) => s + (fn(r) || 0), 0) / readings.length;
}

export default function HomePage() {
  const { readings = [], alertSummary = {}, connected, lastUpdate } = useClimate();

  const avgTemp     = avg(readings, r => r.temperature?.celsius).toFixed(1);
  const avgHumidity = avg(readings, r => r.humidity).toFixed(0);
  const avgAQI      = avg(readings, r => r.airQualityIndex).toFixed(0);
  const avgWind     = avg(readings, r => r.windSpeed).toFixed(0);

  const features = [
    { icon: <MdThermostat />, color: '#ef4444', title: 'Real-Time Temperature', desc: 'Live temperature readings from all stations updated every 5 seconds via WebSocket.' },
    { icon: <MdAir />,        color: '#f97316', title: 'Air Quality Index',     desc: 'Monitor AQI levels across cities with color-coded severity indicators.' },
    { icon: <MdWifi />,       color: '#246BF2', title: 'Live WebSocket Feed',   desc: 'Instant data streaming — no page refresh needed. Always up to date.' },
    { icon: <MdMap />,        color: '#10b981', title: 'Station Map View',      desc: 'Geographic overview of all monitoring stations across India.' },
    { icon: <MdAutoGraph />,  color: '#8b5cf6', title: 'Historical Analytics',  desc: 'Trend charts for temperature, humidity, AQI and wind over 6–72 hours.' },
    { icon: <MdShield />,     color: '#f59e0b', title: 'Smart Alerts',          desc: 'Automatic critical/warning/info alerts with acknowledge & resolve workflow.' },
  ];

  const stats = [
    { value: readings.length || '8',  label: 'Monitoring Stations', icon: <MdLocationOn /> },
    { value: `${avgTemp}°C`,          label: 'Avg Temperature',     icon: <MdThermostat /> },
    { value: avgAQI,                  label: 'Avg AQI',             icon: <MdAir />        },
    { value: (alertSummary.critical || 0) + (alertSummary.warning || 0), label: 'Active Alerts', icon: <MdNotifications /> },
  ];

  return (
    <div className="home">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-badge">
            <span className={`hero-dot ${connected ? 'live' : 'off'}`} />
            {connected ? 'Live Data Streaming' : 'Smart Climate Monitoring'}
          </span>

          <h1 className="hero-title">
            Monitor India's Climate<br />
            <span className="hero-title-blue">In Real Time</span>
          </h1>

          <p className="hero-desc">
            ClimateWatch connects {readings.length || 8} monitoring stations across major Indian cities —
            tracking temperature, humidity, air quality, wind speed and more, live.
          </p>

          {/* ── Live pill + Clock above search ── */}
          <div className="hero-status-row">
            <span className={`hero-live-pill ${connected ? 'live' : 'off'}`}>
              <span className="hero-live-dot" />
              {connected ? 'Live' : 'Offline'}
            </span>
            {lastUpdate && (
              <span className="hero-clock">
                {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <div className="hero-search">
            <MdLocationOn className="hero-search-icon" />
            <input
              className="hero-search-input"
              placeholder="Search city or station…"
              readOnly
              onClick={() => {}}
            />
            <Link to="/dashboard" className="hero-search-btn">Explore →</Link>
          </div>

          <div className="hero-actions">
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard <MdArrowForward />
            </Link>
            <Link to="/map" className="btn-outline">
              View Map
            </Link>
          </div>
        </div>

        {/* Live stats strip */}
        <div className="hero-stats">
          {stats.map(s => (
            <div className="hero-stat" key={s.label}>
              <span className="hero-stat-icon">{s.icon}</span>
              <div>
                <p className="hero-stat-value">{s.value}</p>
                <p className="hero-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE SNAPSHOT ────────────────────────────────── */}
      {readings.length > 0 && (
        <section className="snapshot">
          <div className="section-head">
            <h2>Live Station Snapshot</h2>
            <p>Current readings from all monitoring stations</p>
          </div>
          <div className="snapshot-grid">
            {readings.slice(0, 6).map(r => (
              <SnapshotCard key={r.sensorId} reading={r} />
            ))}
          </div>
          <div className="snapshot-cta">
            <Link to="/dashboard" className="btn-primary">
              View All Stations <MdArrowForward />
            </Link>
          </div>
        </section>
      )}

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="features">
        <div className="section-head">
          <h2>Everything You Need</h2>
          <p>A complete climate intelligence platform for India's urban environment</p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon" style={{ color: f.color, background: f.color + '15' }}>
                {f.icon}
              </span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-inner">
          <h2>Start Monitoring Now</h2>
          <p>Real-time climate data for smarter decisions</p>
          <div className="cta-btns">
            <Link to="/dashboard" className="btn-white">Open Dashboard</Link>
            <Link to="/analytics" className="btn-outline-white">View Analytics</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function SnapshotCard({ reading }) {
  const temp = reading.temperature?.celsius ?? '--';
  const aqi  = reading.airQualityIndex ?? 0;

  const aqiColor = aqi <= 50 ? '#10b981' : aqi <= 100 ? '#f59e0b' : aqi <= 150 ? '#f97316' : '#ef4444';
  const tempColor = temp < 15 ? '#3b82f6' : temp < 25 ? '#10b981' : temp < 35 ? '#f59e0b' : '#ef4444';

  const COND = { sunny:'☀️', cloudy:'☁️', 'partly-cloudy':'⛅', rainy:'🌧️', stormy:'⛈️', foggy:'🌫️', snowy:'❄️', windy:'💨' };

  return (
    <Link to="/dashboard" className="snap-card">
      <div className="snap-top">
        <div>
          <p className="snap-city">{reading.location?.city}</p>
          <p className="snap-station">{reading.location?.name}</p>
        </div>
        <span className="snap-cond">{COND[reading.condition] || '🌡️'}</span>
      </div>
      <p className="snap-temp" style={{ color: tempColor }}>
        {typeof temp === 'number' ? temp.toFixed(1) : temp}°C
      </p>
      <div className="snap-aqi" style={{ borderColor: aqiColor, color: aqiColor, background: aqiColor + '12' }}>
        AQI {Math.round(aqi)}
      </div>
      <div className="snap-meta">
        <span>💧 {reading.humidity?.toFixed(0)}%</span>
        <span>💨 {reading.windSpeed?.toFixed(0)} km/h</span>
      </div>
    </Link>
  );
}
