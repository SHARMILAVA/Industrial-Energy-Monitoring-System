/**
 * Admin Routes
 * Administrative panel API endpoints
 */

const express = require("express");
const router = express.Router();
const alertService = require("../services/alertService");
const comparisonService = require("../services/comparisonService");
const devicePollingService = require("../services/devicePollingService");
const webSocketService = require("../services/websocketService");
const { authRequired } = require("../middleware/auth");

// Admin settings (in production, store in database)
let adminSettings = {
  emissionFactor: Number(process.env.CARBON_EMISSION_FACTOR || 0.82),
  tariffRate: Number(process.env.TARIFF_RATE || 0.18),
  peakRate: 0.20,
  offPeakRate: 0.10,
  shoulderRate: 0.15,
  alertsEnabled: true,
  emailAlertsEnabled: !!process.env.SMTP_HOST
};

/**
 * GET /api/admin/dashboard
 * Get admin dashboard overview
 */
router.get("/dashboard", authRequired, async (req, res, next) => {
  try {
    // Get all registered devices
    const allReadings = devicePollingService.getAllLatestReadings();
    const deviceIds = Object.keys(allReadings);

    // Get alert statistics
    const alertStats = alertService.getAlertStats();

    // Get WebSocket stats
    const wsStats = webSocketService.getStats();

    // Calculate totals
    let totalPower = 0;
    let deviceStatuses = [];

    deviceIds.forEach(deviceId => {
      const reading = allReadings[deviceId];
      const status = devicePollingService.getDeviceStatus(deviceId);
      totalPower += reading?.power || 0;
      deviceStatuses.push({
        deviceId,
        ...status,
        currentPower: reading?.power || 0,
        currentTemp: reading?.temperature || 0
      });
    });

    res.json({
      overview: {
        totalDevices: deviceIds.length,
        activeDevices: deviceStatuses.filter(d => d.status === "active").length,
        totalPower,
        activeAlerts: alertStats.critical + alertStats.warning
      },
      alertStats,
      wsStats,
      devices: deviceStatuses,
      settings: adminSettings
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/alerts
 * Get all alerts with filtering
 */
router.get("/alerts", authRequired, async (req, res, next) => {
  try {
    const { deviceId, severity, limit = 100 } = req.query;

    let alerts = alertService.getAlertHistory(null, parseInt(limit));

    if (deviceId) {
      alerts = alerts.filter(a => a.deviceId === deviceId);
    }

    if (severity) {
      alerts = alerts.filter(a => a.severity === severity.toUpperCase());
    }

    res.json({
      alerts,
      stats: alertService.getAlertStats()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/alerts/:alertId/acknowledge
 * Acknowledge an alert
 */
router.post("/alerts/:alertId/acknowledge", authRequired, async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const alert = alertService.acknowledgeAlert(alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/alerts/:deviceId
 * Clear all alerts for a device
 */
router.delete("/alerts/:deviceId", authRequired, async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    alertService.clearDeviceAlerts(deviceId);
    res.json({ message: "Alerts cleared", deviceId });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/settings
 * Get admin settings
 */
router.get("/settings", authRequired, (req, res) => {
  res.json(adminSettings);
});

/**
 * PUT /api/admin/settings
 * Update admin settings
 */
router.put("/settings", authRequired, (req, res, next) => {
  try {
    const { 
      emissionFactor, 
      tariffRate, 
      peakRate, 
      offPeakRate, 
      shoulderRate,
      alertsEnabled,
      emailAlertsEnabled
    } = req.body;

    if (emissionFactor !== undefined) {
      adminSettings.emissionFactor = Number(emissionFactor);
    }
    if (tariffRate !== undefined) {
      adminSettings.tariffRate = Number(tariffRate);
    }
    if (peakRate !== undefined) {
      adminSettings.peakRate = Number(peakRate);
    }
    if (offPeakRate !== undefined) {
      adminSettings.offPeakRate = Number(offPeakRate);
    }
    if (shoulderRate !== undefined) {
      adminSettings.shoulderRate = Number(shoulderRate);
    }
    if (alertsEnabled !== undefined) {
      adminSettings.alertsEnabled = Boolean(alertsEnabled);
    }
    if (emailAlertsEnabled !== undefined) {
      adminSettings.emailAlertsEnabled = Boolean(emailAlertsEnabled);
    }

    res.json({
      message: "Settings updated",
      settings: adminSettings
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/plant-consumption
 * Get total plant consumption
 */
router.get("/plant-consumption", authRequired, async (req, res, next) => {
  try {
    const allReadings = devicePollingService.getAllLatestReadings();
    const deviceIds = Object.keys(allReadings);

    if (deviceIds.length === 0) {
      return res.json({
        totalPower: 0,
        totalEnergy: 0,
        totalCost: 0,
        totalCO2: 0,
        devices: []
      });
    }

    const plantMetrics = await comparisonService.getPlantMetrics(deviceIds);

    res.json({
      ...plantMetrics.plant,
      ranking: plantMetrics.ranking,
      emissionFactor: adminSettings.emissionFactor,
      tariffRate: adminSettings.tariffRate
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/thresholds/:deviceId
 * Update device thresholds
 */
router.post("/thresholds/:deviceId", authRequired, (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { thresholds } = req.body;

    alertService.setDeviceThresholds(deviceId, thresholds);

    res.json({
      message: "Thresholds updated",
      deviceId,
      thresholds: alertService.getThresholds(deviceId)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/thresholds/:deviceId
 * Get device thresholds
 */
router.get("/thresholds/:deviceId", authRequired, (req, res) => {
  const { deviceId } = req.params;
  res.json(alertService.getThresholds(deviceId));
});

module.exports = router;
