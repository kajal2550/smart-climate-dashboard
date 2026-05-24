const Alert = require('../models/Alert');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

// GET /api/alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const { active, severity, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (active !== undefined) filter.active = active === 'true';
    if (severity) filter.severity = severity;

    const skip = (Number(page) - 1) * Number(limit);
    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Alert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/acknowledge
exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });

    try { getIO().emit('alert_acknowledged', alert); } catch (_) {}
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/resolve
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { active: false, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });

    try { getIO().emit('alert_resolved', alert); } catch (_) {}
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/summary
exports.getAlertSummary = async (req, res, next) => {
  try {
    const summary = await Alert.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    const result = { info: 0, warning: 0, critical: 0 };
    summary.forEach((s) => { result[s._id] = s.count; });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
