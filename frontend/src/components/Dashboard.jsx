import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useClimate } from '../context/ClimateContext';
import ClimateCard from './ClimateCard';
import ClimateCharts from './ClimateCharts';
import AlertPanel from './AlertPanel';
import StatsBar from './StatsBar';
import LiveFeed from './LiveFeed';
import { FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

function Dashboard() {
  const {
    readings, alertSummary, loading, error,
    connected, lastUpdate, liveEvents, flashingSensors, refresh,
  } = useClimate();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { search } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const filterCity = queryParams.get('city');

  useEffect(() => {
    if (filterCity && readings.length > 0) {
      const match = readings.find(
        r => r.location?.city?.toLowerCase() === filterCity.toLowerCase()
      );
      if (match) {
        setSelectedSensor(match.sensorId);
      }
    }
  }, [filterCity, readings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-ring" />
        <p>Loading climate data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <div>
          <h2 className="dashboard-title">Climate Overview</h2>
          {lastUpdate && (
            <p className="dashboard-sub">
              Last updated: {lastUpdate.toLocaleTimeString()} •{' '}
              <span className={connected ? 'text-green' : 'text-muted'}>
                {connected ? '● Live' : '○ Polling'}
              </span>
            </p>
          )}
        </div>
        <button
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          title="Refresh data"
        >
          <FiRefreshCw />
        </button>
      </div>

      {error && (
        <div className="error-banner">
          ⚠ Could not reach API: {error}. Showing cached data.
        </div>
      )}

      {/* Stats summary */}
      <StatsBar readings={readings} alertSummary={alertSummary} />

      {/* Main content: sensor grid + live feed side-by-side */}
      <div className="dashboard-body">
        <div className="dashboard-main">
          {/* Sensor grid */}
          <div className="section-heading">
            <h3>Monitoring Stations ({readings.length})</h3>
            {selectedSensor && (
              <button className="btn-clear" onClick={() => setSelectedSensor(null)}>
                Clear selection
              </button>
            )}
          </div>

          <div className="cards-grid">
            <AnimatePresence>
              {readings.map((reading) => (
                <motion.div
                  key={reading.sensorId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ClimateCard
                    reading={reading}
                    selected={selectedSensor === reading.sensorId}
                    flashing={flashingSensors.has(reading.sensorId)}
                    onClick={() =>
                      setSelectedSensor(
                        selectedSensor === reading.sensorId ? null : reading.sensorId
                      )
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Charts */}
          {selectedSensor && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="charts-section"
            >
              <h3 className="section-heading">
                Sensor Analytics —{' '}
                {readings.find((r) => r.sensorId === selectedSensor)?.location?.city}
              </h3>
              <ClimateCharts sensorId={selectedSensor} />
            </motion.div>
          )}

          {/* Alert panel */}
          <AlertPanel />
        </div>

        {/* Live feed sidebar */}
        <LiveFeed events={liveEvents} connected={connected} />
      </div>
    </div>
  );
}

export default Dashboard;
