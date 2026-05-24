import React, { useState, useEffect } from 'react';
import { useClimate } from '../context/ClimateContext';
import { fetchChartData } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { MdBarChart, MdThermostat, MdAir, MdWater, MdSpeed } from 'react-icons/md';
import './AnalyticsPage.css';

const COLORS = ['#246BF2','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tooltip-label">{new Date(label).toLocaleString()}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { readings, loading } = useClimate();
  const [chartData, setChartData]   = useState({});
  const [hours, setHours]           = useState(24);
  const [activeSensor, setActive]   = useState(null);

  useEffect(() => {
    if (!readings.length) return;
    const first = readings[0]?.sensorId;
    if (!activeSensor) setActive(first);
  }, [readings]);

  useEffect(() => {
    if (!activeSensor) return;
    fetchChartData(activeSensor, hours)
      .then(r => setChartData(prev => ({ ...prev, [activeSensor]: r.data.data || [] })))
      .catch(console.error);
  }, [activeSensor, hours]);

  if (loading) return <div className="an-loading">Loading analytics...</div>;

  const data = (chartData[activeSensor] || []).map(d => ({ ...d, time: d._id }));

  // Summary stats from all readings
  const avg = (fn) => readings.length
    ? (readings.reduce((s, r) => s + (fn(r) || 0), 0) / readings.length).toFixed(1)
    : '—';

  const summaryCards = [
    { label: 'Avg Temperature', value: `${avg(r => r.temperature?.celsius)}°C`, icon: <MdThermostat />, color: '#ef4444' },
    { label: 'Avg Humidity',    value: `${avg(r => r.humidity)}%`,              icon: <MdWater />,      color: '#06b6d4' },
    { label: 'Avg AQI',         value: avg(r => r.airQualityIndex),             icon: <MdAir />,        color: '#f97316' },
    { label: 'Avg Wind',        value: `${avg(r => r.windSpeed)} km/h`,         icon: <MdSpeed />,      color: '#8b5cf6' },
  ];

  return (
    <div className="an-page">
      {/* Header */}
      <div className="an-header">
        <div className="an-title">
          <MdBarChart className="an-title-icon" />
          <div>
            <h2>Analytics</h2>
            <p>Historical trends across all monitoring stations</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="an-summary">
        {summaryCards.map(c => (
          <div className="an-sum-card" key={c.label}>
            <span className="an-sum-icon" style={{ color: c.color, background: c.color + '18' }}>{c.icon}</span>
            <div>
              <p className="an-sum-value" style={{ color: c.color }}>{c.value}</p>
              <p className="an-sum-label">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="an-controls">
        <div className="an-sensor-tabs">
          {readings.map((r, i) => (
            <button
              key={r.sensorId}
              className={`an-sensor-btn${activeSensor === r.sensorId ? ' active' : ''}`}
              style={activeSensor === r.sensorId ? { borderColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length], background: COLORS[i % COLORS.length] + '12' } : {}}
              onClick={() => setActive(r.sensorId)}
            >
              {r.location?.city}
            </button>
          ))}
        </div>
        <div className="an-hours">
          {[6, 12, 24, 48, 72].map(h => (
            <button key={h} className={`an-h-btn${hours === h ? ' active' : ''}`} onClick={() => setHours(h)}>{h}h</button>
          ))}
        </div>
      </div>

      {/* Charts */}
      {data.length === 0 ? (
        <div className="an-empty">No data available for this period.</div>
      ) : (
        <div className="an-charts">
          <ChartCard title="Temperature (°C)" color="#ef4444">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tickFormatter={v => new Date(v).getHours() + 'h'} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avgTemp" stroke="#ef4444" fill="url(#tg)" strokeWidth={2} name="Avg Temp" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Humidity (%)" color="#06b6d4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tickFormatter={v => new Date(v).getHours() + 'h'} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avgHumidity" stroke="#06b6d4" fill="url(#hg)" strokeWidth={2} name="Humidity" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Air Quality Index" color="#f97316">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tickFormatter={v => new Date(v).getHours() + 'h'} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgAQI" fill="#f97316" name="AQI" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Wind Speed & Rainfall" color="#8b5cf6">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tickFormatter={v => new Date(v).getHours() + 'h'} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="avgWindSpeed"  stroke="#8b5cf6" strokeWidth={2} name="Wind (km/h)" dot={false} />
                <Line type="monotone" dataKey="totalRainfall" stroke="#246BF2" strokeWidth={2} name="Rainfall (mm)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, color, children }) {
  return (
    <div className="an-chart-card">
      <h4 className="an-chart-title" style={{ color }}>{title}</h4>
      {children}
    </div>
  );
}
