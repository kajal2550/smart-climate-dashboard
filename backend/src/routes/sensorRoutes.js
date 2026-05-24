const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sensorController');

router.get('/', ctrl.getSensors);
router.get('/:sensorId', ctrl.getSensor);
router.post('/', ctrl.createSensor);
router.patch('/:sensorId/status', ctrl.updateSensorStatus);

module.exports = router;
