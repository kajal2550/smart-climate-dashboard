import React from 'react';
import { WiThermometer, WiHumidity, WiBarometer, WiStrongWind } from 'react-icons/wi';
import { MdAir, MdVisibility, MdWaterDrop } from 'react-icons/md';
import { FiSun } from 'react-icons/fi';
import './ClimateCard.css';

const CONDITION_ICONS = {
  sunny: '☀️', cloudy: '☁️', 'partly-cloudy': '⛅', rainy: '🌧️',
  stormy: '⛈️', foggy: '🌫️', snowy: '❄️', windy: '💨',
};

const AQI_COLORS = {
  0: '#10b981',   // Good
  51: '#f59e0b',  // Moderate
  101: '#f97316', // Unhealthy SG
  151: '#ef4444', // Unhealthy
  201: '#8b5cf6', // Very Unhealthy
  301: '#7f1d1d', // Hazardous
};

function getAQIColor(aqi) {
  const thresholds = [301, 201, 151, 101, 51, 0];
  for (const t of thresholds) {
    if (aqi >= t) return AQI_COLORS[t];
  }
  return '#10b981';
}

function getAQILabel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'USG';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Bad';
  return 'Hazardous';
}

function getTempColor(temp) {
  if (temp < 0) return '#06b6d4';
  if (temp < 15) return '#3b82f6';
  if (temp < 25) return '#10b981';
  if (temp < 35) return '#f59e0b';
  return '#ef4444';
}

function ClimateCard({ reading, selected, flashing, onClick }) {
  const temp = reading.temperature?.celsius ?? '--';
  const aqi = reading.airQualityIndex ?? 0;
  const aqiColor = getAQIColor(aqi);
  const tempColor = getTempColor(temp);

  return (
    <div className={`climate-card ${selected ? 'selected' : ''} ${flashing ? 'flashing' : ''}`} onClick={onClick}>
      <div className="card-header">
        <div>
          <h4 className="card-city">{reading.location?.city}</h4>
          <p className="card-station">{reading.location?.name}</p>
        </div>
        <span className="condition-icon" title={reading.condition}>
          {CONDITION_ICONS[reading.condition] || '🌡️'}
        </span>
      </div>

      <div className="card-temp" style={{ color: tempColor }}>
        <span className="temp-value">{typeof temp === 'number' ? temp.toFixed(1) : temp}</span>
        <span className="temp-unit">°C</span>
        {reading.temperature?.fahrenheit && (
          <span className="temp-f">{reading.temperature.fahrenheit.toFixed(1)}°F</span>
        )}
      </div>

      <div className="card-aqi" style={{ borderColor: aqiColor }}>
        <span className="aqi-label">AQI</span>
        <span className="aqi-value" style={{ color: aqiColor }}>{Math.round(aqi)}</span>
        <span className="aqi-cat" style={{ color: aqiColor }}>{getAQILabel(aqi)}</span>
      </div>

      <div className="card-metrics">
        <MetricItem icon={<WiHumidity />} label="Humidity" value={`${reading.humidity?.toFixed(0)}%`} color="#06b6d4" />
        <MetricItem icon={<WiBarometer />} label="Pressure" value={`${reading.pressure?.toFixed(0)} hPa`} color="#8b5cf6" />
        <MetricItem icon={<WiStrongWind />} label="Wind" value={`${reading.windSpeed?.toFixed(0)} km/h ${reading.windDirection || ''}`} color="#f59e0b" />
        <MetricItem icon={<MdVisibility />} label="Visibility" value={`${reading.visibility?.toFixed(0)} km`} color="#94a3b8" />
        <MetricItem icon={<FiSun />} label="UV Index" value={reading.uvIndex ?? '--'} color="#f97316" />
        <MetricItem icon={<MdWaterDrop />} label="Rain" value={`${reading.rainfall?.toFixed(1) ?? 0} mm`} color="#3b82f6" />
      </div>

      <div className="card-footer">
        <span className="sensor-id">{reading.sensorId}</span>
        <span className="card-hint">Click for charts →</span>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value, color }) {
  return (
    <div className="metric-item">
      <span className="metric-icon" style={{ color }}>{icon}</span>
      <div>
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
      </div>
    </div>
  );
}

export default ClimateCard;
