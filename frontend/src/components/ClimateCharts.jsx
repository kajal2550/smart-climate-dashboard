import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { fetchChartData } from '../services/api';
import './ClimateCharts.css';

const HOURS_OPTIONS = [6, 12, 24, 48, 72];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{new Date(label).toLocaleString()}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function ClimateCharts({ sensorId }) {
  const [chartData, setChartData] = useState([]);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sensorId) return;
    setLoading(true);
    fetchChartData(sensorId, hours)
      .then((res) => setChartData(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sensorId, hours]);

  const formatted = chartData.map((d) => ({ ...d, time: d._id }));

  return (
    <div className="charts-container">
      <div className="charts-controls">
        {HOURS_OPTIONS.map((h) => (
          <button
            key={h}
            className={`hours-btn ${hours === h ? 'active' : ''}`}
            onClick={() => setHours(h)}
          >
            {h}h
          </button>
        ))}
      </div>

      {loading ? (
        <div className="chart-loading">Loading charts...</div>
      ) : chartData.length === 0 ? (
        <div className="chart-empty">No chart data available for this period.</div>
      ) : (
        <div className="charts-grid">
          <ChartCard title="Temperature (°C)" color="#ef4444">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={formatted}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tickFormatter={(v) => new Date(v).getHours() + 'h'} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avgTemp" stroke="#ef4444" fill="url(#tempGrad)" strokeWidth={2} name="Avg Temp" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Humidity (%)" color="#06b6d4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={formatted}>
                <defs>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tickFormatter={(v) => new Date(v).getHours() + 'h'} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avgHumidity" stroke="#06b6d4" fill="url(#humGrad)" strokeWidth={2} name="Humidity" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Air Quality Index" color="#f97316">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tickFormatter={(v) => new Date(v).getHours() + 'h'} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgAQI" fill="#f97316" name="AQI" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Wind Speed (km/h) & Rainfall (mm)" color="#8b5cf6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={formatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tickFormatter={(v) => new Date(v).getHours() + 'h'} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="avgWindSpeed" stroke="#8b5cf6" strokeWidth={2} name="Wind" dot={false} />
                <Line type="monotone" dataKey="totalRainfall" stroke="#3b82f6" strokeWidth={2} name="Rainfall" dot={false} />
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
    <div className="chart-card">
      <h4 className="chart-title" style={{ color }}>{title}</h4>
      {children}
    </div>
  );
}

export default ClimateCharts;
