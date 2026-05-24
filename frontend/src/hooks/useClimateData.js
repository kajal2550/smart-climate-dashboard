import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { fetchLatestReadings, fetchAlertSummary } from '../services/api';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';

export function useClimateData() {
  const [readings, setReadings] = useState([]);
  const [alertSummary, setAlertSummary] = useState({ info: 0, warning: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

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

  useEffect(() => {
    loadData();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('bulk_update', (newReadings) => {
      setReadings(newReadings);
      setLastUpdate(new Date());
    });

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
    });

    socket.on('new_alert', () => {
      fetchAlertSummary().then((res) => setAlertSummary(res.data.data));
    });

    // Fallback polling every 60 s
    const poll = setInterval(loadData, 60000);

    return () => {
      socket.disconnect();
      clearInterval(poll);
    };
  }, [loadData]);

  return { readings, alertSummary, loading, error, connected, lastUpdate, refresh: loadData };
}
