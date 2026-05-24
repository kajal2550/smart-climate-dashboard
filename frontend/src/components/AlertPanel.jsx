import React, { useState, useEffect } from 'react';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '../services/api';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import './AlertPanel.css';

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <FaExclamationTriangle />, label: 'Critical' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <FaExclamationTriangle />, label: 'Warning' },
  info: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <FaInfoCircle />, label: 'Info' },
};

function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadAlerts = () => {
    const params = { active: true, limit: 20 };
    if (filter !== 'all') params.severity = filter;
    fetchAlerts(params)
      .then((res) => setAlerts(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAlerts(); }, [filter]);

  const handleAck = async (id) => {
    await acknowledgeAlert(id);
    loadAlerts();
  };

  const handleResolve = async (id) => {
    await resolveAlert(id);
    loadAlerts();
  };

  if (loading) return null;
  if (!alerts.length) return null;

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="alert-panel">
      <div className="alert-panel-header">
        <h3 className="alert-panel-title">
          <FaExclamationTriangle className="title-icon" />
          Active Alerts ({alerts.length})
        </h3>
        <div className="alert-filters">
          {['all', 'critical', 'warning', 'info'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''} ${f}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="alerts-list">
        {filtered.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          return (
            <div
              className="alert-item"
              key={alert._id}
              style={{ borderLeftColor: cfg.color, background: cfg.bg }}
            >
              <span className="alert-icon" style={{ color: cfg.color }}>{cfg.icon}</span>
              <div className="alert-body">
                <p className="alert-title">{alert.title}</p>
                <p className="alert-message">{alert.message}</p>
                <p className="alert-meta">
                  {alert.sensorId} · {new Date(alert.createdAt).toLocaleString()}
                  {alert.acknowledged && <span className="ack-badge">✓ Acknowledged</span>}
                </p>
              </div>
              <div className="alert-actions">
                {!alert.acknowledged && (
                  <button className="btn-ack" onClick={() => handleAck(alert._id)}>Ack</button>
                )}
                <button className="btn-resolve" onClick={() => handleResolve(alert._id)}>Resolve</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlertPanel;
