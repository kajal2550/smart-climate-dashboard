const mongoose = require('mongoose');

const climateDataSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: [true, 'Sensor ID is required'],
      trim: true,
      index: true,
    },
    location: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: 'IN' },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },
    temperature: {
      celsius: { type: Number, required: true, min: -50, max: 60 },
      fahrenheit: { type: Number },
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    pressure: {
      type: Number,
      required: true,
      min: 870,
      max: 1085,
    },
    windSpeed: {
      type: Number,
      required: true,
      min: 0,
      max: 200,
    },
    windDirection: {
      type: String,
      enum: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    },
    airQualityIndex: {
      type: Number,
      min: 0,
      max: 500,
    },
    uvIndex: {
      type: Number,
      min: 0,
      max: 11,
    },
    visibility: {
      type: Number,
      min: 0,
      max: 100,
    },
    rainfall: {
      type: Number,
      min: 0,
      default: 0,
    },
    cloudCover: {
      type: Number,
      min: 0,
      max: 100,
    },
    condition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'snowy', 'windy', 'partly-cloudy'],
      default: 'sunny',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

climateDataSchema.index({ sensorId: 1, timestamp: -1 });
climateDataSchema.index({ timestamp: -1 });

climateDataSchema.pre('save', function (next) {
  if (this.temperature) {
    this.temperature.fahrenheit = parseFloat(
      ((this.temperature.celsius * 9) / 5 + 32).toFixed(2)
    );
  }
  next();
});

climateDataSchema.methods.getAQICategory = function () {
  const aqi = this.airQualityIndex;
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const ClimateData = mongoose.model('ClimateData', climateDataSchema);
module.exports = ClimateData;
