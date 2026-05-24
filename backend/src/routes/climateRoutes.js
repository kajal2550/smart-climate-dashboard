const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/climateController');

const readingValidation = [
  body('sensorId').notEmpty().trim(),
  body('location.name').notEmpty().trim(),
  body('location.city').notEmpty().trim(),
  body('temperature.celsius').isFloat({ min: -50, max: 60 }),
  body('humidity').isFloat({ min: 0, max: 100 }),
  body('pressure').isFloat({ min: 870, max: 1085 }),
  body('windSpeed').isFloat({ min: 0, max: 200 }),
];

router.get('/latest', ctrl.getLatest);
router.get('/stats', ctrl.getStats);
router.get('/sensor/:sensorId', ctrl.getSensorHistory);
router.get('/chart/:sensorId', ctrl.getChartData);
router.post('/', readingValidation, ctrl.createReading);
router.delete('/old', ctrl.deleteOldData);

module.exports = router;
