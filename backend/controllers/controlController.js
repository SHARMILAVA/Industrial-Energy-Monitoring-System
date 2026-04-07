const devicePollingService = require("../services/devicePollingService");
const alertService = require("../services/alertService");

const TEMP_WARNING = 40;
const TEMP_CRITICAL = 60;
const MAX_HISTORY = 500;

const controlState = new Map();
const temperatureHistory = new Map();

const getOrCreateState = (deviceId) => {
  if (!controlState.has(deviceId)) {
    controlState.set(deviceId, {
      relayStatus: "ON",
      autoShutdownEnabled: false,
      manualOverride: false,
      lastAlertLevel: "normal",
      lastAlertMessage: "",
      updatedAt: new Date().toISOString()
    });
  }
  return controlState.get(deviceId);
};

const classifyTemperature = (temperature) => {
  if (temperature > TEMP_CRITICAL) return "critical";
  if (temperature >= TEMP_WARNING) return "warning";
  return "normal";
};

const pushTemperatureHistory = (deviceId, reading, status, state) => {
  const current = temperatureHistory.get(deviceId) || [];
  current.unshift({
    deviceId,
    temperature: Number(reading?.temperature || 0),
    status,
    relayStatus: state.relayStatus,
    autoShutdownEnabled: state.autoShutdownEnabled,
    timestamp: reading?.timestamp || new Date().toISOString()
  });
  if (current.length > MAX_HISTORY) {
    current.length = MAX_HISTORY;
  }
  temperatureHistory.set(deviceId, current);
};

const maybeEmitAlert = (deviceId, reading, state, level) => {
  if (level === state.lastAlertLevel) {
    return;
  }

  if (level === "warning") {
    state.lastAlertMessage = `Warning: Temperature crossed 40°C (${Number(reading.temperature).toFixed(1)}°C)`;
    alertService.processAlert(
      alertService.createAlert(
        deviceId,
        "WARNING",
        "HIGH_TEMPERATURE",
        state.lastAlertMessage,
        reading
      )
    );
  } else if (level === "critical") {
    state.lastAlertMessage = `🚨 Device Overheating! Temperature: ${Number(reading.temperature).toFixed(1)}°C`;
    alertService.processAlert(
      alertService.createAlert(
        deviceId,
        "CRITICAL",
        "OVER_TEMPERATURE",
        state.lastAlertMessage,
        reading
      )
    );
  } else {
    state.lastAlertMessage = "Temperature is back to safe range.";
  }

  state.lastAlertLevel = level;
};

const buildSmartInsight = (history = []) => {
  const recent = history.slice(0, 100);
  if (!recent.length) {
    return "No temperature history yet. Keep monitoring enabled to generate safety insights.";
  }

  const overheatRows = recent.filter((row) => row.status === "critical");
  const peakOverheats = overheatRows.filter((row) => {
    const hour = new Date(row.timestamp).getHours();
    return hour >= 18 && hour < 22;
  });

  if (peakOverheats.length >= 3) {
    return "💡 Device frequently overheating during peak hours. Shift heavy loads to off-peak times or improve cooling.";
  }

  if (overheatRows.length > 0) {
    return "💡 Frequent temperature spikes detected. Check ventilation and reduce continuous high-load operation.";
  }

  return "💡 Temperature is stable. Continue current operation and periodically check cooling airflow.";
};

const computeControlPayload = async (deviceId) => {
  const state = getOrCreateState(deviceId);
  let reading = devicePollingService.getLatestReading(deviceId);

  if (!reading) {
    try {
      reading = await devicePollingService.fetchLatestReading(deviceId);
    } catch (error) {
      reading = {
        deviceId,
        voltage: 0,
        current: 0,
        power: 0,
        energy: 0,
        temperature: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  const temperature = Number(reading?.temperature || 0);
  const status = classifyTemperature(temperature);

  if (!state.manualOverride) {
    if (status === "critical") {
      state.relayStatus = "OFF";
      state.autoShutdownEnabled = true;
    } else {
      state.autoShutdownEnabled = false;
      state.relayStatus = "ON";
    }
  }

  maybeEmitAlert(deviceId, reading, state, status);
  state.updatedAt = new Date().toISOString();

  pushTemperatureHistory(deviceId, reading, status, state);

  const history = temperatureHistory.get(deviceId) || [];

  return {
    deviceId,
    reading,
    thresholds: {
      normalMax: 39.9,
      warningMin: 40,
      warningMax: 60,
      criticalMin: 60.1
    },
    temperatureStatus: status,
    relayStatus: state.relayStatus,
    autoShutdownEnabled: state.autoShutdownEnabled,
    manualOverride: state.manualOverride,
    warningNotification: status === "warning" ? `⚠️ High temperature detected: ${temperature.toFixed(1)}°C` : "",
    criticalAlert: status === "critical" ? `🚨 Device Overheating! Temperature: ${temperature.toFixed(1)}°C` : "",
    lastAlertMessage: state.lastAlertMessage,
    smartInsight: buildSmartInsight(history),
    history: history.slice(0, 100),
    updatedAt: state.updatedAt
  };
};

const getControl = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const payload = await computeControlPayload(deviceId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

const setManualControl = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { action } = req.body;

    if (!["ON", "OFF"].includes(String(action || "").toUpperCase())) {
      return res.status(400).json({ message: "action must be ON or OFF" });
    }

    const state = getOrCreateState(deviceId);
    state.manualOverride = true;
    state.autoShutdownEnabled = false;
    state.relayStatus = String(action).toUpperCase();
    state.updatedAt = new Date().toISOString();

    const payload = await computeControlPayload(deviceId);
    res.json({
      ...payload,
      relayStatus: state.relayStatus,
      manualOverride: true,
      autoShutdownEnabled: false,
      message: `Manual override applied: relay turned ${state.relayStatus}`
    });
  } catch (error) {
    next(error);
  }
};

const clearManualOverride = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const state = getOrCreateState(deviceId);
    state.manualOverride = false;
    state.updatedAt = new Date().toISOString();

    const payload = await computeControlPayload(deviceId);
    res.json({
      ...payload,
      message: "Manual override cleared. Automatic safety control re-enabled."
    });
  } catch (error) {
    next(error);
  }
};

const getTemperatureHistory = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const history = temperatureHistory.get(deviceId) || [];
    res.json({
      deviceId,
      history: history.slice(0, limit)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getControl,
  setManualControl,
  clearManualOverride,
  getTemperatureHistory
};
