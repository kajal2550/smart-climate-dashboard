import React from 'react';
import { useClimate } from '../context/ClimateContext';
import { MdMap, MdLocationOn } from 'react-icons/md';
import './MapPage.css';

// City coordinates for Indian cities
const CITY_COORDS = {
  'Bengaluru':  { lat: 12.9716, lng: 77.5946 },
  'Chennai':    { lat: 13.0827, lng: 80.2707 },
  'Hyderabad':  { lat: 17.3850, lng: 78.4867 },
  'Kolkata':    { lat: 22.5726, lng: 88.3639 },
  'Mumbai':     { lat: 19.0760, lng: 72.8777 },
  'New Delhi':  { lat: 28.6139, lng: 77.2090 },
  'Pune':       { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad':  { lat: 23.0225, lng: 72.5714 },
};

function getAQIColor(aqi) {
  if (aqi <= 50)  return '#10b981';
  if (aqi <= 100) return '#f59e0b';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#8b5cf6';
  return '#7f1d1d';
}

function getAQILabel(aqi) {
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'USG';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Bad';
  return 'Hazardous';
}

export default function MapPage() {
  const { readings, loading } = useClimate();

  if (loading) return <div className="map-loading">Loading map data...</div>;

  return (
    <div className="map-page">
      <div className="map-page-header">
        <div className="map-page-title">
          <MdMap className="map-title-icon" />
          <div>
            <h2>Station Map</h2>
            <p>Geographic overview of all monitoring stations</p>
          </div>
        </div>
        <span className="map-count">{readings.length} stations</span>
      </div>

      {/* SVG India map placeholder with station markers */}
      <div className="map-container">
        <div className="map-embed-wrap">
          <iframe
            title="India Climate Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C8.0%2C97.5%2C37.5&layer=mapnik`}
            className="map-iframe"
          />
          <div className="map-overlay-note">
            <MdLocationOn /> Interactive map — station pins shown below
          </div>
        </div>

        {/* Station grid cards */}
        <div className="map-stations">
          {readings.map((r) => {
            const aqi   = r.airQualityIndex ?? 0;
            const color = getAQIColor(aqi);
            const coords = r.location?.coordinates || CITY_COORDS[r.location?.city] || {};
            return (
              <div className="map-station-card" key={r.sensorId}>
                <div className="msc-pin" style={{ background: color }}>
                  <MdLocationOn />
                </div>
                <div className="msc-body">
                  <p className="msc-city">{r.location?.city}</p>
                  <p className="msc-name">{r.location?.name}</p>
                  <div className="msc-stats">
                    <span className="msc-temp">{r.temperature?.celsius?.toFixed(1)}°C</span>
                    <span className="msc-aqi" style={{ color, background: color + '18', border: `1px solid ${color}44` }}>
                      AQI {Math.round(aqi)} · {getAQILabel(aqi)}
                    </span>
                  </div>
                  {coords.lat && (
                    <p className="msc-coords">{coords.lat.toFixed(2)}°N, {coords.lng.toFixed(2)}°E</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
