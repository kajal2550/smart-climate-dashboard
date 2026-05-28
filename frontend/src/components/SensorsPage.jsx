import React, { useEffect, useState } from 'react';
import { fetchSensors } from '../services/api';
import './SensorsPage.css';

const STATUS_COLORS = { active: '#10b981', inactive: '#64748b', maintenance: '#f59e0b' };

function SensorsPage() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensors()
      .then((res) => setSensors(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading sensors...</div>;

  return (
    <div className="sensors-page">
      <div className="page-header">
        <h2>Monitoring Sensors</h2>
        <span className="count-badge">{sensors.length} sensors</span>
      </div>

      <div className="sensors-table-wrap">
        <table className="sensors-table">
          <thead>
            <tr>
              <th>Sensor ID</th>
              <th>Name</th>
              <th>City</th>
              <th>Type</th>
              <th>Status</th>
              <th>Battery</th>
              <th>Firmware</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((s) => (
              <tr key={s.sensorId}>
                <td><code>{s.sensorId}</code></td>
                <td>{s.name}</td>
                <td>{s.location?.city}</td>
                <td><span className="type-badge">{s.type}</span></td>
                <td>
                  <span className="status-dot" style={{ background: STATUS_COLORS[s.status] }} />
                  {s.status}
                </td>
                <td>
                  <div className="battery-bar">
                    <div className="battery-fill" style={{ width: `${s.batteryLevel}%`, background: s.batteryLevel > 30 ? '#10b981' : '#ef4444' }} />
                  </div>
                  <span className="battery-pct">{s.batteryLevel}%</span>
                </td>
                <td><code>{s.firmware}</code></td>
                <td>{s.lastSeen ? new Date(s.lastSeen).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SensorsPage;
