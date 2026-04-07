/**
 * Alert Service
 * Handles industrial-level alert management including:
 * - Peak demand alarms
 * - Over-temperature shutdown alerts
 * - Abnormal fluctuation detection
 * - Energy spike detection
 * - Email/SMS notifications
 */

const nodemailer = require("nodemailer");
const { EventEmitter } = require("events");

class AlertService extends EventEmitter {
  constructor() {
    super();
    this.alerts = [];
    this.alertHistory = [];
    this.alertRules = new Map();
    this.deviceAlerts = new Map();
    this.maxHistorySize = 1000;
    
    // Email configuration (optional)
    this.emailTransporter = null;
    this.emailEnabled = false;
    
    // Thresholds
    this.defaultThresholds = {
      power: { warning: 3000, critical: 4500 },
      temperature: { warning: 45, critical: 60 },
      voltage: { low: 200, high: 250 },
      current: { warning: 15, critical: 20 },
      powerFactor: { low: 0.75, warning: 0.85 },
      fluctuationPercent: 25 // % change from average
    };
  }

  /**
   * Initialize email notifications
   */
  initializeEmail(config) {
    if (!config || !config.host) {
      console.log("Email notifications not configured");
      return;
    }

    this.emailTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port || 587,
      secure: config.secure || false,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    this.emailConfig = config;
    this.emailEnabled = true;
    console.log("Email notifications initialized");
  }

  /**
   * Set device-specific thresholds
   */
  setDeviceThresholds(deviceId, thresholds) {
    const existing = this.deviceAlerts.get(deviceId) || {};
    this.deviceAlerts.set(deviceId, {
      ...existing,
      thresholds: { ...this.defaultThresholds, ...thresholds }
    });
  }

  /**
   * Get thresholds for a device
   */
  getThresholds(deviceId) {
    const deviceConfig = this.deviceAlerts.get(deviceId);
    return deviceConfig?.thresholds || this.defaultThresholds;
  }

  /**
   * Analyze reading and generate alerts
   */
  analyzeReading(deviceId, reading, historicalAvg = null) {
    const thresholds = this.getThresholds(deviceId);
    const alerts = [];

    // Peak Demand Alert
    if (reading.power > thresholds.power.critical) {
      alerts.push(this.createAlert(deviceId, "CRITICAL", "PEAK_DEMAND", 
        `Critical power load: ${reading.power.toFixed(0)}W exceeds ${thresholds.power.critical}W`, reading));
    } else if (reading.power > thresholds.power.warning) {
      alerts.push(this.createAlert(deviceId, "WARNING", "HIGH_POWER",
        `High power consumption: ${reading.power.toFixed(0)}W`, reading));
    }

    // Over-Temperature Alert
    if (reading.temperature > thresholds.temperature.critical) {
      alerts.push(this.createAlert(deviceId, "CRITICAL", "OVER_TEMPERATURE",
        `SHUTDOWN ALERT: Temperature ${reading.temperature.toFixed(1)}°C exceeds safe limit`, reading));
    } else if (reading.temperature > thresholds.temperature.warning) {
      alerts.push(this.createAlert(deviceId, "WARNING", "HIGH_TEMPERATURE",
        `High temperature: ${reading.temperature.toFixed(1)}°C`, reading));
    }

    // Voltage Alerts
    if (reading.voltage < thresholds.voltage.low) {
      alerts.push(this.createAlert(deviceId, "WARNING", "LOW_VOLTAGE",
        `Low voltage: ${reading.voltage.toFixed(1)}V`, reading));
    } else if (reading.voltage > thresholds.voltage.high) {
      alerts.push(this.createAlert(deviceId, "WARNING", "HIGH_VOLTAGE",
        `High voltage: ${reading.voltage.toFixed(1)}V`, reading));
    }

    // Current Overload
    if (reading.current > thresholds.current.critical) {
      alerts.push(this.createAlert(deviceId, "CRITICAL", "CURRENT_OVERLOAD",
        `Current overload: ${reading.current.toFixed(2)}A`, reading));
    } else if (reading.current > thresholds.current.warning) {
      alerts.push(this.createAlert(deviceId, "WARNING", "HIGH_CURRENT",
        `High current: ${reading.current.toFixed(2)}A`, reading));
    }

    // Fluctuation Detection (requires historical data)
    if (historicalAvg && historicalAvg.power > 0) {
      const fluctuation = Math.abs(reading.power - historicalAvg.power) / historicalAvg.power * 100;
      if (fluctuation > thresholds.fluctuationPercent) {
        alerts.push(this.createAlert(deviceId, "WARNING", "FLUCTUATION",
          `Abnormal power fluctuation: ${fluctuation.toFixed(1)}% deviation from average`, reading));
      }
    }

    // Process alerts
    alerts.forEach(alert => this.processAlert(alert));

    return alerts;
  }

  /**
   * Create alert object
   */
  createAlert(deviceId, severity, type, message, reading) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      severity, // INFO, WARNING, CRITICAL
      type,
      message,
      reading: {
        power: reading.power,
        voltage: reading.voltage,
        current: reading.current,
        temperature: reading.temperature
      },
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
  }

  /**
   * Process an alert (store, emit, notify)
   */
  async processAlert(alert) {
    // Add to current alerts
    this.alerts.unshift(alert);
    
    // Limit current alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Add to history
    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(0, this.maxHistorySize);
    }

    // Emit event for real-time notifications
    this.emit("alert", alert);

    // Send email for critical alerts
    if (alert.severity === "CRITICAL" && this.emailEnabled) {
      await this.sendEmailAlert(alert);
    }

    return alert;
  }

  /**
   * Send email notification
   */
  async sendEmailAlert(alert) {
    if (!this.emailTransporter || !this.emailConfig?.recipients) {
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: this.emailConfig.from || "IoT Dashboard <noreply@iotdashboard.local>",
        to: this.emailConfig.recipients,
        subject: `🚨 ${alert.severity}: ${alert.type} - Device ${alert.deviceId}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: #fff;">
            <h2 style="color: ${alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'};">
              ⚡ Industrial Alert: ${alert.type}
            </h2>
            <p><strong>Device:</strong> ${alert.deviceId}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${alert.timestamp}</p>
            <hr style="border-color: #374151;">
            <h4>Current Readings:</h4>
            <ul>
              <li>Power: ${alert.reading.power.toFixed(2)} W</li>
              <li>Voltage: ${alert.reading.voltage.toFixed(2)} V</li>
              <li>Current: ${alert.reading.current.toFixed(2)} A</li>
              <li>Temperature: ${alert.reading.temperature.toFixed(2)} °C</li>
            </ul>
          </div>
        `
      });
      console.log(`Email alert sent for ${alert.id}`);
    } catch (error) {
      console.error("Failed to send email alert:", error.message);
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(deviceId = null) {
    if (deviceId) {
      return this.alerts.filter(a => a.deviceId === deviceId && !a.acknowledged);
    }
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Get alert history
   */
  getAlertHistory(deviceId = null, limit = 50) {
    let history = this.alertHistory;
    if (deviceId) {
      history = history.filter(a => a.deviceId === deviceId);
    }
    return history.slice(0, limit);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      this.emit("alertAcknowledged", alert);
      return alert;
    }
    return null;
  }

  /**
   * Clear all alerts for a device
   */
  clearDeviceAlerts(deviceId) {
    this.alerts = this.alerts.filter(a => a.deviceId !== deviceId);
    this.emit("alertsCleared", deviceId);
  }

  /**
   * Get alert statistics
   */
  getAlertStats() {
    const stats = {
      total: this.alerts.length,
      critical: this.alerts.filter(a => a.severity === "CRITICAL" && !a.acknowledged).length,
      warning: this.alerts.filter(a => a.severity === "WARNING" && !a.acknowledged).length,
      acknowledged: this.alerts.filter(a => a.acknowledged).length,
      byDevice: {},
      byType: {}
    };

    this.alerts.forEach(alert => {
      if (!alert.acknowledged) {
        stats.byDevice[alert.deviceId] = (stats.byDevice[alert.deviceId] || 0) + 1;
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      }
    });

    return stats;
  }
}

// Singleton instance
const alertService = new AlertService();

module.exports = alertService;
