import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  Flame,
  Power,
  RefreshCw,
  ShieldAlert,
  Thermometer,
  ToggleLeft
} from "lucide-react";
import {
  enableAutoSafety,
  fetchControlStatus,
  fetchTemperatureHistory,
  setManualRelay
} from "../services/control";

const statusMap = {
  normal: {
    label: "🟢 Normal",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  warning: {
    label: "🟡 Warning",
    className: "bg-amber-50 text-amber-700 border-amber-200"
  },
  critical: {
    label: "🔴 Overheat",
    className: "bg-rose-50 text-rose-700 border-rose-200"
  }
};

const DeviceControlPanel = ({ devices = [] }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [criticalPopupOpen, setCriticalPopupOpen] = useState(false);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.deviceId === selectedDeviceId) || devices[0],
    [devices, selectedDeviceId]
  );

  useEffect(() => {
    if (devices.length && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [devices, selectedDeviceId]);

  const loadControl = async (deviceId) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const [status, historyResp] = await Promise.all([
        fetchControlStatus(deviceId),
        fetchTemperatureHistory(deviceId, 30)
      ]);
      setStatusData(status);
      setHistory(historyResp?.history || []);
      if (status?.temperatureStatus === "critical") {
        setCriticalPopupOpen(true);
      }
    } catch (error) {
      console.error("Failed to load automated control status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDeviceId) return;
    loadControl(selectedDeviceId);
    const interval = setInterval(() => loadControl(selectedDeviceId), 5000);
    return () => clearInterval(interval);
  }, [selectedDeviceId]);

  const handleManual = async (action) => {
    if (!selectedDeviceId) return;
    setActionLoading(true);
    try {
      const updated = await setManualRelay(selectedDeviceId, action);
      setStatusData(updated);
    } catch (error) {
      console.error("Manual relay control failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoMode = async () => {
    if (!selectedDeviceId) return;
    setActionLoading(true);
    try {
      const updated = await enableAutoSafety(selectedDeviceId);
      setStatusData(updated);
    } catch (error) {
      console.error("Failed to re-enable auto safety:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!devices.length) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
        <ShieldAlert className="w-10 h-10 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-700 font-semibold">No devices available</p>
        <p className="text-slate-500 text-sm mt-1">Add a device first to enable automated safety control.</p>
      </div>
    );
  }

  const temp = Number(statusData?.reading?.temperature || 0);
  const statusKey = statusData?.temperatureStatus || "normal";
  const statusView = statusMap[statusKey] || statusMap.normal;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
          <div className="w-full md:max-w-sm">
            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Select Device</label>
            <select
              value={selectedDeviceId}
              onChange={(event) => setSelectedDeviceId(event.target.value)}
              className="w-full mt-2 px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => loadControl(selectedDeviceId)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">🌡️ Temperature & Safety Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Device</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{selectedDevice?.name || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Real-time Temperature</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{temp.toFixed(1)}°C</p>
          </div>
          <div className={`rounded-xl border p-4 ${statusView.className}`}>
            <p className="text-xs uppercase tracking-wide">Status</p>
            <p className="text-xl font-semibold mt-1">{statusView.label}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-700 uppercase tracking-wide">Relay State</p>
            <p className="text-lg font-semibold text-blue-900 mt-1">{statusData?.relayStatus || "ON"}</p>
            <p className="text-sm text-blue-800 mt-1">
              {statusData?.autoShutdownEnabled ? "Auto Shutdown Enabled" : "Monitoring Active"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Threshold Levels</p>
            <p className="text-sm text-slate-700 mt-2">🟢 Normal: below 40°C</p>
            <p className="text-sm text-slate-700">🟡 Warning: 40°C to 60°C</p>
            <p className="text-sm text-slate-700">🔴 Critical: above 60°C</p>
          </div>
        </div>
      </div>

      {statusData?.warningNotification && statusKey === "warning" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {statusData.warningNotification}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Automated Control</h4>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            disabled={actionLoading || loading}
            onClick={() => handleManual("ON")}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50"
          >
            Turn ON
          </button>
          <button
            type="button"
            disabled={actionLoading || loading}
            onClick={() => handleManual("OFF")}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium disabled:opacity-50"
          >
            Turn OFF
          </button>
          <button
            type="button"
            disabled={actionLoading || loading}
            onClick={handleAutoMode}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 inline-flex items-center gap-2"
          >
            <ToggleLeft className="w-4 h-4" /> Enable Auto Safety
          </button>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          Manual override is {statusData?.manualOverride ? "enabled" : "disabled"}. Automatic shutdown triggers when temperature exceeds 60°C.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Temperature Log</h4>
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {history.length ? (
              history.slice(0, 12).map((entry) => (
                <div key={`${entry.timestamp}-${entry.temperature}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">{Number(entry.temperature || 0).toFixed(1)}°C</p>
                    <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No temperature history yet.</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">Smart Insight</h4>
          <p className="text-sm text-blue-900">{statusData?.smartInsight || "💡 Collecting data to generate insights..."}</p>
          <div className="mt-4 text-sm text-blue-800 space-y-2">
            <p className="flex items-start gap-2"><Thermometer className="w-4 h-4 mt-0.5" /> Real-time sensor temperature is monitored continuously.</p>
            <p className="flex items-start gap-2"><Flame className="w-4 h-4 mt-0.5" /> Critical overheat automatically shuts down the relay.</p>
            <p className="flex items-start gap-2"><Clock3 className="w-4 h-4 mt-0.5" /> Temperature history is logged for trend analysis.</p>
          </div>
        </div>
      </div>

      {criticalPopupOpen && statusData?.criticalAlert && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-rose-200 shadow-xl p-5">
            <h4 className="text-lg font-semibold text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Critical Safety Alert
            </h4>
            <p className="text-slate-700 mt-3">{statusData.criticalAlert}</p>
            <p className="text-sm text-slate-600 mt-2">Auto Shutdown Enabled. Device has been turned OFF for safety.</p>
            <button
              type="button"
              onClick={() => setCriticalPopupOpen(false)}
              className="mt-4 w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white py-2 font-medium"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceControlPanel;
