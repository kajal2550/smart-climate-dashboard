// MongoDB initialization script — runs once on first startup
db = db.getSiblingDB('climate_db');

db.createCollection('climatedatas');
db.createCollection('alerts');
db.createCollection('sensors');

db.climatedatas.createIndex({ sensorId: 1, timestamp: -1 });
db.climatedatas.createIndex({ timestamp: -1 }, { expireAfterSeconds: 604800 }); // TTL 7 days
db.alerts.createIndex({ active: 1, severity: 1 });
db.alerts.createIndex({ createdAt: -1 });
db.sensors.createIndex({ sensorId: 1 }, { unique: true });

print('✅ MongoDB collections and indexes initialized');
