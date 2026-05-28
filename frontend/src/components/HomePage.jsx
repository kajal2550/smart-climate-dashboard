import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClimate } from '../context/ClimateContext';
import { fetchAlerts } from '../services/api';
import {
  MdNotifications, MdMap, MdArrowForward, MdThermostat, MdAir,
  MdWifi, MdShield, MdAutoGraph, MdLocationOn, MdWarning, MdOpenInNew,
} from 'react-icons/md';
import './HomePage.css';

function avg(readings, fn) {
  if (!readings.length) return 0;
  return readings.reduce((s, r) => s + (fn(r) || 0), 0) / readings.length;
}

/* ── Static News Data ─────────────────────────────────────────── */
const NEWS = [
  {
    id: 1,
    category: 'Weather News',
    title: 'Woman dies after vehicle is swept away in Mississippi flash flooding',
    time: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    tag: 'Flooding',
  },
  {
    id: 2,
    category: 'Weather News',
    title: "This 'terrifying' fish will give you nightmares",
    time: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80',
    tag: 'Nature',
  },
  {
    id: 3,
    category: 'Weather News',
    title: 'The critical forecast behind the D-Day invasion',
    time: '8 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    tag: 'Forecast',
  },
];

const TRENDING = [
  {
    id: 1,
    title: 'Woman killed after winds lift umbrella at South Carolina beach resort',
    time: '1 hour ago',
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Plant thought extinct for nearly 60 years found again in Australian outback',
    time: '54 minutes ago',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: "'Zero shadow day' makes photos look like CGI",
    time: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
  },
];

const HURRICANE = [
  {
    id: 1,
    title: 'Atlantic hurricane season forecast 2026: 11-16 named storms expected',
    time: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&auto=format&fit=crop&q=80',
    tag: 'Forecast',
  },
  {
    id: 2,
    title: '6 things you can do right now to prepare for the hurricane season',
    time: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&auto=format&fit=crop&q=80',
    tag: 'Safety',
  },
  {
    id: 3,
    title: '2026 Atlantic hurricane names: What will storm systems be called this year?',
    time: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
    tag: 'Radar',
  },
];

const SPACE = [
  {
    id: 1,
    title: "A 'Strawberry Moon,' three-planet meetup headline June's night sky",
    time: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=600&auto=format&fit=crop&q=80',
    tag: 'Astronomy',
  },
  {
    id: 2,
    title: 'Blue Moon, 4 planets to shine during the final weekend of May',
    time: '4 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=600&auto=format&fit=crop&q=80',
    tag: 'Skywatch',
  },
  {
    id: 3,
    title: "'Beautiful but hostile': NASA reveals detailed moon base design",
    time: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&auto=format&fit=crop&q=80',
    tag: 'Spaceflight',
  },
];

const NATURE = [
  {
    id: 1,
    title: '10 best hiking trails in the Himalayas for this summer',
    time: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=600&auto=format&fit=crop&q=80',
    tag: 'Outdoors',
  },
  {
    id: 2,
    title: 'Deep in the ancient redwood forests: A journey through time',
    time: '6 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop&q=80',
    tag: 'Adventure',
  },
  {
    id: 3,
    title: 'Under the stars: The ultimate guide to camping in wild parks',
    time: '12 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&auto=format&fit=crop&q=80',
    tag: 'Camping',
  },
];

/* ── Severity helpers ─────────────────────────────────────────── */
function severityColor(sev) {
  return sev === 'critical' ? '#ef4444' : sev === 'warning' ? '#f59e0b' : '#3b82f6';
}

function getAlertImage(type = '', title = '') {
  const t = (type || '').toLowerCase();
  const text = (title || '').toLowerCase();
  if (t.includes('temp') || text.includes('heat') || text.includes('temperature') || text.includes('hot')) {
    return 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=600&auto=format&fit=crop&q=80';
  }
  if (t.includes('aqi') || text.includes('pollution') || text.includes('smog') || text.includes('smoke') || text.includes('air')) {
    return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80';
  }
  if (t.includes('wind') || text.includes('wind') || text.includes('cyclone') || text.includes('storm')) {
    return 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=600&auto=format&fit=crop&q=80';
  }
  if (t.includes('humid') || text.includes('rain') || text.includes('flood') || text.includes('water')) {
    return 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?w=600&auto=format&fit=crop&q=80';
}

export default function HomePage() {
  const { readings = [], alertSummary = {}, connected, lastUpdate } = useClimate();
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('recent_locations');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!parsed.includes('Ludhiana')) {
        return ['Ludhiana', ...parsed].slice(0, 3);
      }
      return parsed;
    } catch {
      return ['Ludhiana'];
    }
  });

  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const searchResults = searchQuery.trim() === ''
    ? []
    : readings.filter(r =>
        r.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.location?.city?.toLowerCase() === 'ludhiana' && 'punjab'.includes(searchQuery.toLowerCase()))
      ).slice(0, 5);

  const selectCity = (reading) => {
    const cityName = reading.location?.city;
    if (!cityName) return;

    const nextRecents = [cityName, ...recentLocations.filter(c => c !== cityName)].slice(0, 3);
    setRecentLocations(nextRecents);
    localStorage.setItem('recent_locations', JSON.stringify(nextRecents));

    setSearchQuery('');
    setShowDropdown(false);
    navigate(`/dashboard?city=${encodeURIComponent(cityName)}`);
  };

  useEffect(() => {
    fetchAlerts({ active: true, limit: 10 })
      .then(res => {
        setAlerts(res.data?.data || []);
      })
      .catch(err => {
        console.error('Error fetching alerts for HomePage:', err);
      });
  }, []);

  const avgTemp     = avg(readings, r => r.temperature?.celsius).toFixed(1);
  const avgAQI      = avg(readings, r => r.airQualityIndex).toFixed(0);

  // latest 3 critical/warning alerts for Severe Weather Tracker
  const severeAlerts = (alerts || [])
    .filter(a => a.severity === 'critical' || a.severity === 'warning')
    .slice(0, 3);

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

          <div className="hero-search-wrapper" ref={searchContainerRef}>
            <div className="hero-search">
              <MdLocationOn className="hero-search-icon" />
              <input
                className="hero-search-input"
                placeholder="Search your Address, City or Zip Code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <button 
                className="hero-search-btn"
                onClick={() => {
                  if (searchResults.length > 0) selectCity(searchResults[0]);
                }}
              >
                Search
              </button>
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(r => (
                  <div 
                    key={r.sensorId} 
                    className="search-dropdown-item"
                    onClick={() => selectCity(r)}
                  >
                    <span className="sdi-city">{r.location?.city}</span>
                    <span className="sdi-name">{r.location?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Locations Widget */}
          {recentLocations.length > 0 && (
            <div className="recent-locations-section">
              <p className="recent-title">RECENT LOCATIONS</p>
              <div className="recent-grid">
                {recentLocations.map(cityName => {
                  const reading = readings.find(r => r.location?.city === cityName);
                  if (!reading) return null;

                  const temp = reading.temperature?.celsius ?? 0;
                  const humidity = reading.humidity ?? 50;
                  const realFeel = Math.round(temp + (humidity - 50) / 10);
                  const COND = { sunny:'☀️', cloudy:'☁️', 'partly-cloudy':'⛅', rainy:'🌧️', stormy:'⛈️', foggy:'🌫️', snowy:'❄️', windy:'💨' };

                  return (
                    <div 
                      key={cityName} 
                      className="recent-card"
                      onClick={() => navigate(`/dashboard?city=${encodeURIComponent(cityName)}`)}
                    >
                      <div className="recent-card-left">
                        <p className="recent-card-city">{cityName}</p>
                        <p className="recent-card-country">India</p>
                      </div>
                      <div className="recent-card-right">
                        <span className="recent-card-icon">{COND[reading.condition] || '🌡️'}</span>
                        <div className="recent-card-temp-group">
                          <span className="recent-card-temp">{temp.toFixed(0)}°</span>
                          <span className="recent-card-realfeel">RealFeel® {realFeel}°</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

      {/* ── WEATHER NEWS ─────────────────────────────────── */}
      <section className="news-section">
        <div className="section-head">
          <h2>Weather News</h2>
          <Link to="/alerts" className="see-more-link">See more →</Link>
        </div>
        <div className="news-grid">
          {NEWS.map(n => (
            <div className="news-card" key={n.id}>
              <div className="news-img">
                <div className="news-img-inner" style={{ backgroundImage: `url(${n.imageUrl})` }} />
                <span className="news-tag">{n.tag}</span>
              </div>
              <div className="news-body">
                <p className="news-title">{n.title}</p>
                <span className="news-time">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEVERE WEATHER TRACKER ───────────────────────── */}
      <section className="severe-section">
        <div className="section-head">
          <h2><MdWarning style={{ color: '#f59e0b', verticalAlign: 'middle', marginRight: 6 }} />Severe Weather Tracker</h2>
          <Link to="/alerts" className="see-more-link">See more →</Link>
        </div>
        <div className="news-grid">
          {severeAlerts.length > 0 ? severeAlerts.map(a => (
            <div className="news-card severe-card" key={a._id}>
              <div className="news-img">
                <div className="news-img-inner" style={{ backgroundImage: `url(${getAlertImage(a.type, a.title || a.message)})` }} />
                <span className="news-tag" style={{ background: severityColor(a.severity) }}>{a.severity?.toUpperCase()}</span>
              </div>
              <div className="news-body">
                <p className="news-title">{a.title || a.message}</p>
                <span className="news-time">{a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Just now'}</span>
              </div>
            </div>
          )) : (
            /* fallback static cards when no live alerts */
            [
              { id: 1, title: 'Dust storm warning issued for Rajasthan — visibility drops below 500m', time: '1 hour ago', imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80' },
              { id: 2, title: 'Thunderstorm alert for coastal Andhra Pradesh and Odisha', time: '3 hours ago', imageUrl: 'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?w=600&auto=format&fit=crop&q=80' },
              { id: 3, title: 'Heavy rainfall warning for Mumbai — waterlogging expected', time: '5 hours ago', imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80' },
            ].map(f => (
              <div className="news-card severe-card" key={f.id}>
                <div className="news-img">
                  <div className="news-img-inner" style={{ backgroundImage: `url(${f.imageUrl})` }} />
                  <span className="news-tag" style={{ background: '#f59e0b' }}>WARNING</span>
                </div>
                <div className="news-body">
                  <p className="news-title">{f.title}</p>
                  <span className="news-time">{f.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── INDIA WEATHER RADAR ─────────────────────────── */}
      <section className="radar-section">
        <div className="section-head">
          <h2>India Weather Radar</h2>
          <a
            href="https://www.windy.com/?rain,20,78,5"
            target="_blank"
            rel="noopener noreferrer"
            className="see-more-link"
          >
            Open full map <MdOpenInNew style={{ verticalAlign: 'middle', fontSize: 14 }} />
          </a>
        </div>
        <div className="radar-wrapper">
          <iframe
            title="India Weather Radar"
            src="https://embed.windy.com/embed2.html?lat=20&lon=78&detailLat=20&detailLon=78&width=100%&height=450&zoom=5&level=surface&overlay=rain&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
            allowFullScreen
            className="radar-iframe"
          />
          <div className="radar-legend">
            <span>🟢 Light</span>
            <span>🟡 Moderate</span>
            <span>🟠 Heavy</span>
            <span>🔴 Extreme</span>
          </div>
        </div>
      </section>

      {/* ── TRENDING TODAY ───────────────────────────────── */}
      <section className="trending-section">
        <div className="section-head">
          <h2>Trending Today</h2>
          <Link to="/analytics" className="see-more-link">See more →</Link>
        </div>
        <div className="news-grid">
          {TRENDING.map(t => (
            <div className="news-card trending-card" key={t.id}>
              <div className="news-img">
                <div className="news-img-inner" style={{ backgroundImage: `url(${t.imageUrl})` }} />
              </div>
              <div className="news-body">
                <p className="news-title">{t.title}</p>
                <span className="news-time">{t.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HURRICANE CENTER ─────────────────────────────── */}
      <section className="hurricane-section">
        <div className="section-head">
          <h2>Hurricane Center</h2>
          <Link to="/alerts" className="see-more-link">See more →</Link>
        </div>
        <div className="news-grid">
          {HURRICANE.map(h => (
            <div className="news-card hurricane-card" key={h.id}>
              <div className="news-img">
                <div className="news-img-inner" style={{ backgroundImage: `url(${h.imageUrl})` }} />
                {h.tag && <span className="news-tag">{h.tag}</span>}
              </div>
              <div className="news-body">
                <p className="news-title">{h.title}</p>
                <span className="news-time">{h.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPACE AND ASTRONOMY ───────────────────────────── */}
      <section className="space-section">
        <div className="section-head">
          <h2>Space and Astronomy</h2>
          <Link to="/analytics" className="see-more-link">See more →</Link>
        </div>
        <div className="news-grid">
          {SPACE.map(s => (
            <div className="news-card space-card" key={s.id}>
              <div className="news-img">
                <div className="news-img-inner" style={{ backgroundImage: `url(${s.imageUrl})` }} />
                {s.tag && <span className="news-tag">{s.tag}</span>}
              </div>
              <div className="news-body">
                <p className="news-title">{s.title}</p>
                <span className="news-time">{s.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NATURE AND OUTDOORS ───────────────────────────── */}
      <section className="nature-section">
        <div className="section-head">
          <h2>Nature and Outdoors</h2>
          <Link to="/analytics" className="see-more-link">See more →</Link>
        </div>
        <div className="news-grid">
          {NATURE.map(n => (
            <div className="news-card nature-card" key={n.id}>
              <div className="news-img">
                <div className="news-img-inner" style={{ backgroundImage: `url(${n.imageUrl})` }} />
                {n.tag && <span className="news-tag">{n.tag}</span>}
              </div>
              <div className="news-body">
                <p className="news-title">{n.title}</p>
                <span className="news-time">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
