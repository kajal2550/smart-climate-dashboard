import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from 'react';
import { io } from 'socket.io-client';
import { fetchLatestReadings, fetchAlertSummary } from '../services/api';

const ClimateContext = createContext(null);

export function ClimateProvider({ children }) {
  const [readings, setReadings]           = useState([]);
  const [alertSummary, setAlertSummary]   = useState({ info: 0, warning: 0, critical: 0 });
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [connected, setConnected]         = useState(false);
  const [lastUpdate, setLastUpdate]       = useState(null);
  const [liveEvents, setLiveEvents]       = useState([]);   // recent activity feed
  const [flashingSensors, setFlashing]    = useState(new Set()); // sensors flashing on update
  const socketRef = useRef(null);

  // ── Load initial snapshot ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [climateRes, alertRes] = await Promise.all([
        fetchLatestReadings(),
        fetchAlertSummary(),
      ]);
      setReadings(climateRes.data.data || []);
      setAlertSummary(alertRes.data.data || { info: 0, warning: 0, critical: 0 });
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Append to live-event feed (keep last 30) ──────────────────────────────
  const pushEvent = useCallback((evt) => {
    setLiveEvents((prev) => [{ ...evt, id: Date.now() + Math.random() }, ...prev].slice(0, 30));
  }, []);

  // ── Flash a sensor card for 2 s ───────────────────────────────────────────
  const flashSensor = useCallback((sensorId) => {
    setFlashing((prev) => new Set(prev).add(sensorId));
    setTimeout(() => {
      setFlashing((prev) => {
        const next = new Set(prev);
        next.delete(sensorId);
        return next;
      });
    }, 2000);
  }, []);

  // ── Socket.IO setup ───────────────────────────────────────────────────────
  useEffect(() => {
    loadData();

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      pushEvent({ type: 'system', message: '🟢 Connected to live feed' });
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      pushEvent({ type: 'system', message: `🔴 Disconnected (${reason})` });
    });

    socket.on('connect_error', () => {
      setConnected(false);
    });

    // ── Single-sensor update (emitted every ~5 s by simulator) ──────────────
    socket.on('climate_update', (reading) => {
      setReadings((prev) => {
        const idx = prev.findIndex((r) => r.sensorId === reading.sensorId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = reading;
          return next;
        }
        return [...prev, reading];
      });
      setLastUpdate(new Date());
      flashSensor(reading.sensorId);
      pushEvent({
        type: 'update',
        sensorId: reading.sensorId,
        city: reading.location?.city,
        temp: reading.temperature?.celsius,
        aqi: reading.airQualityIndex,
      });
    });

    // ── Bulk update (emitted every ~30 s) ────────────────────────────────────
    socket.on('bulk_update', (newReadings) => {
      setReadings(newReadings);
      setLastUpdate(new Date());
      newReadings.forEach((r) => flashSensor(r.sensorId));
      pushEvent({ type: 'bulk', count: newReadings.length });
    });

    // ── New alert ────────────────────────────────────────────────────────────
    socket.on('new_alert', (alert) => {
      fetchAlertSummary()
        .then((res) => setAlertSummary(res.data.data))
        .catch(() => {});
      pushEvent({
        type: 'alert',
        severity: alert.severity,
        title: alert.title,
        sensorId: alert.sensorId,
      });
    });

    socket.on('alert_resolved', () => {
      fetchAlertSummary().then((res) => setAlertSummary(res.data.data)).catch(() => {});
    });

    // ── Fallback polling every 60 s ───────────────────────────────────────────
    const poll = setInterval(loadData, 60_000);

    return () => {
      socket.disconnect();
      clearInterval(poll);
    };
  }, [loadData, pushEvent, flashSensor]);

  return (
    <ClimateContext.Provider
      value={{
        readings,
        alertSummary,
        loading,
        error,
        connected,
        lastUpdate,
        liveEvents,
        flashingSensors,
        refresh: loadData,
      }}
    >
      {children}
    </ClimateContext.Provider>
  );
}

export const useClimate = () => {
  const ctx = useContext(ClimateContext);
  if (!ctx) throw new Error('useClimate must be used inside <ClimateProvider>');
  return ctx;
};
