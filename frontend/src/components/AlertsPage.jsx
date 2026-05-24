import React, { useEffect, useState } from 'react';
import { fetchAlerts, fetchAlertSummary, acknowledgeAlert, resolveAlert } from '../services/api';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useClimate } from '../context/ClimateContext';
import {
  MdCheckCircle, MdWarning, MdInfo, MdThermostat,
  MdAir, MdWater, MdSpeed, MdVisibility, MdWbSunny,
} from 'react-icons/md';
import './AlertsPage.css';

/* ── Alert threshold guide shown when no alerts ─────── */
const THRESHOLDS = [
  { icon: <MdThermostat />, color: '#ef4444', label: 'Temperature', warn: '> 40°C', critical: '> 45°C', tip: 'Extreme heat — stay hydrated, avoid outdoor activity.' },
  { icon: <MdAir />,        color: '#f97316', label: 'Air Quality',  warn: 'AQI > 100', critical: 'AQI > 200', tip: 'Wear N95 mask outdoors. Keep windows closed.' },
  { icon: <MdWater />,      color: '#06b6d4', label: 'Humidity',     warn: '> 85%', critical: '> 95%', tip: 'High humidity increases heat stress risk.' },
  { icon: <MdSpeed />,      color: '#8b5cf6', label: 'Wind Speed',   warn: '> 60 km/h', critical: '> 90 km/h', tip: 'Strong winds — secure loose objects outdoors.' },
  { icon: <MdVisibility />, color: '#64748b', label: 'Visibility',   warn: '< 5 km', critical: '< 1 km', tip: 'Low visibility — drive carefully, use fog lights.' },
  { icon: <MdWbSunny />,    color: '#f59e0b', label: 'UV Index',     warn: '> 6', critical: '> 8', tip: 'High UV — apply SPF 50+ sunscreen, wear hat.' },
];

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const { readings = [] } = useClimate();

  const load = () => {
    const params = { limit: 100 };
    if (filter === 'active') params.active = true;
    else if (filter === 'resolved') params.active = false;

    Promise.all([fetchAlerts(params), fetchAlertSummary()])
      .then(([alertRes, summRes]) => {
        setAlerts(alertRes.data.data || []);
        setSummary(summRes.data.data || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleAck = async (id) => { await acknowledgeAlert(id); load(); };
  const handleResolve = async (id) => { await resolveAlert(id); load(); };

  const totalAlerts = (summary.critical || 0) + (summary.warning || 0) + (summary.info || 0);

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h2>Alerts Center</h2>
        <p className="page-sub">Real-time environmental alerts from all monitoring stations</p>
      </div>

      <div className="summary-cards">
        <SummaryCard label="Critical" count={summary.critical || 0} color="#ef4444" icon={<MdWarning />} desc="Immediate action required" />
        <SummaryCard label="Warning"  count={summary.warning  || 0} color="#f59e0b" icon={<MdWarning />} desc="Monitor closely" />
        <SummaryCard label="Info"     count={summary.info     || 0} color="#3b82f6" icon={<MdInfo />}    desc="Informational notices" />
      </div>

      <div className="filter-row">
        {['active', 'resolved', 'all'].map((f) => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading">Loading alerts...</div>
      ) : !alerts.length ? (
        /* ── Rich empty state ── */
        <div className="alerts-empty-rich">
          <div className="aer-hero">
            <MdCheckCircle className="aer-icon" />
            <h3>All Clear — No {filter === 'active' ? 'Active' : filter === 'resolved' ? 'Resolved' : ''} Alerts</h3>
            <p>All {readings.length || 8} monitoring stations are operating within safe thresholds.</p>
          </div>

          {/* Station status mini-grid */}
          {readings.length > 0 && (
            <div className="aer-stations">
              <h4 className="aer-section-title">Current Station Status</h4>
              <div className="aer-station-grid">
                {readings.map(r => {
                  const aqi  = r.airQualityIndex ?? 0;
                  const temp = r.temperature?.celsius ?? 0;
                  const status = aqi > 200 || temp > 45 ? 'critical' : aqi > 100 || temp > 40 ? 'warning' : 'ok';
                  const statusColor = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
                  const statusLabel = status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : 'Normal';
                  return (
                    <div className="aer-station-card" key={r.sensorId}>
                      <div className="aer-station-top">
                        <span className="aer-station-city">{r.location?.city}</span>
                        <span className="aer-status-dot" style={{ background: statusColor }} title={statusLabel} />
                      </div>
                      <div className="aer-station-vals">
                        <span style={{ color: '#ef4444' }}>{temp.toFixed(1)}°C</span>
                        <span style={{ color: aqi > 100 ? '#f97316' : '#10b981' }}>AQI {Math.round(aqi)}</span>
                        <span style={{ color: '#06b6d4' }}>{r.humidity?.toFixed(0)}%</span>
                      </div>
                      <span className="aer-station-label" style={{ color: statusColor, background: statusColor + '15' }}>{statusLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alert threshold guide */}
          <div className="aer-thresholds">
            <h4 className="aer-section-title">Alert Threshold Guide</h4>
            <div className="aer-threshold-grid">
              {THRESHOLDS.map(t => (
                <div className="aer-threshold-card" key={t.label}>
                  <span className="aer-th-icon" style={{ color: t.color, background: t.color + '15' }}>{t.icon}</span>
                  <div className="aer-th-body">
                    <p className="aer-th-label">{t.label}</p>
                    <div className="aer-th-levels">
                      <span className="aer-th-warn">⚠ Warning: {t.warn}</span>
                      <span className="aer-th-crit">🚨 Critical: {t.critical}</span>
                    </div>
                    <p className="aer-th-tip">{t.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="alerts-full-list">
          {alerts.map((alert) => (
            <AlertRow key={alert._id} alert={alert} onAck={handleAck} onResolve={handleResolve} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert, onAck, onResolve }) {
  const colors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  const c = colors[alert.severity] || '#3b82f6';
  return (
    <div className="alert-row" style={{ borderLeftColor: c }}>
      <FaExclamationTriangle style={{ color: c, flexShrink: 0 }} />
      <div className="alert-row-body">
        <p className="ar-title">{alert.title}</p>
        <p className="ar-msg">{alert.message}</p>
        <p className="ar-meta">
          <code>{alert.sensorId}</code>
          <span>{new Date(alert.createdAt).toLocaleString()}</span>
          <span className={`sev-tag ${alert.severity}`}>{alert.severity}</span>
          {alert.acknowledged && <span className="ack-tag">Acknowledged</span>}
          {!alert.active && <span className="resolved-tag">Resolved</span>}
        </p>
      </div>
      {alert.active && (
        <div className="ar-actions">
          {!alert.acknowledged && (
            <button className="btn-ack" onClick={() => onAck(alert._id)}>Acknowledge</button>
          )}
          <button className="btn-resolve" onClick={() => onResolve(alert._id)}>Resolve</button>
        </div>
      )}
    </div>
  );
}

export default AlertsPage;

function SummaryCard({ label, count, color, icon, desc }) {
  return (
    <div className="summary-card" style={{ borderColor: color }}>
      <span className="sum-icon" style={{ color, background: color + '15' }}>{icon}</span>
      <span className="sum-count" style={{ color }}>{count}</span>
      <span className="sum-label">{label}</span>
      <span className="sum-desc">{desc}</span>
    </div>
  );
}
