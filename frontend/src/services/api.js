import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// Climate
export const fetchLatestReadings = () => api.get('/climate/latest');
export const fetchSensorHistory = (sensorId, hours = 24) =>
  api.get(`/climate/sensor/${sensorId}`, { params: { hours } });
export const fetchChartData = (sensorId, hours = 24) =>
  api.get(`/climate/chart/${sensorId}`, { params: { hours } });
export const fetchStats = (sensorId, hours = 24) =>
  api.get('/climate/stats', { params: { sensorId, hours } });

// Alerts
export const fetchAlerts = (params = {}) => api.get('/alerts', { params });
export const fetchAlertSummary = () => api.get('/alerts/summary');
export const acknowledgeAlert = (id) => api.patch(`/alerts/${id}/acknowledge`);
export const resolveAlert = (id) => api.patch(`/alerts/${id}/resolve`);

// Sensors
export const fetchSensors = () => api.get('/sensors');

export default api;
