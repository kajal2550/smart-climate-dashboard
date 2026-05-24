import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineStream } from 'react-icons/md';
import './LiveFeed.css';

const EVENT_CONFIG = {
  update: { color: '#06b6d4', label: 'UPDATE' },
  alert:  { color: '#ef4444', label: 'ALERT'  },
  bulk:   { color: '#8b5cf6', label: 'SYNC'   },
  system: { color: '#64748b', label: 'SYS'    },
};

function formatTime(id) {
  // id = timestamp + random float — extract the integer portion
  return new Date(Math.floor(id)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function EventRow({ event }) {
  const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.system;

  let body = '';
  if (event.type === 'update') {
    body = `${event.city} — ${event.temp?.toFixed(1)}°C · AQI ${Math.round(event.aqi || 0)}`;
  } else if (event.type === 'alert') {
    body = `[${event.severity?.toUpperCase()}] ${event.title}`;
  } else if (event.type === 'bulk') {
    body = `${event.count} sensors synced`;
  } else {
    body = event.message;
  }

  return (
    <motion.div
      className="feed-row"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <span className="feed-badge" style={{ background: cfg.color + '22', color: cfg.color, borderColor: cfg.color + '44' }}>
        {cfg.label}
      </span>
      <div className="feed-body">
        <span className="feed-text">{body}</span>
        <span className="feed-time">{formatTime(event.id)}</span>
      </div>
    </motion.div>
  );
}

function LiveFeed({ events = [], connected }) {
  return (
    <aside className="live-feed">
      <div className="feed-header">
        <MdOutlineStream className="feed-icon" />
        <span>Live Feed</span>
        <span className={`feed-status ${connected ? 'on' : 'off'}`}>
          {connected ? 'LIVE' : 'PAUSED'}
        </span>
      </div>

      <div className="feed-list">
        {events.length === 0 ? (
          <div className="feed-empty">Waiting for events…</div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((evt) => (
              <EventRow key={evt.id} event={evt} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}

export default LiveFeed;
