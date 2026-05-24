import React from 'react';
import { WiThermometer, WiHumidity, WiStrongWind } from 'react-icons/wi';
import { MdAir, MdWarning } from 'react-icons/md';
import './StatsBar.css';

function avg(readings, fn) {
  if (!readings.length) return 0;
  return readings.reduce((s, r) => s + (fn(r) || 0), 0) / readings.length;
}

function StatsBar({ readings = [], alertSummary = {} }) {
  const avgTemp = avg(readings, (r) => r.temperature?.celsius).toFixed(1);
  const avgHumidity = avg(readings, (r) => r.humidity).toFixed(0);
  const avgAQI = avg(readings, (r) => r.airQualityIndex).toFixed(0);
  const avgWind = avg(readings, (r) => r.windSpeed).toFixed(0);

  const stats = [
    { label: 'Avg Temperature', value: `${avgTemp}°C`, icon: <WiThermometer />, color: '#ef4444' },
    { label: 'Avg Humidity', value: `${avgHumidity}%`, icon: <WiHumidity />, color: '#06b6d4' },
    { label: 'Avg AQI', value: avgAQI, icon: <MdAir />, color: '#f97316' },
    { label: 'Avg Wind', value: `${avgWind} km/h`, icon: <WiStrongWind />, color: '#8b5cf6' },
    {
      label: 'Active Alerts',
      value: (alertSummary.critical || 0) + (alertSummary.warning || 0) + (alertSummary.info || 0),
      icon: <MdWarning />,
      color: alertSummary.critical > 0 ? '#ef4444' : alertSummary.warning > 0 ? '#f59e0b' : '#10b981',
    },
  ];

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div className="stat-item" key={s.label}>
          <span className="stat-icon" style={{ color: s.color }}>{s.icon}</span>
          <div>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
