const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alertController');

router.get('/', ctrl.getAlerts);
router.get('/summary', ctrl.getAlertSummary);
router.patch('/:id/acknowledge', ctrl.acknowledgeAlert);
router.patch('/:id/resolve', ctrl.resolveAlert);

module.exports = router;
