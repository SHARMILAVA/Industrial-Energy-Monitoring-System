import React, { useEffect, useMemo, useState } from "react";
import {
  BatteryCharging,
  BarChart3,
  CalendarDays,
  Clock3,
  Cpu,
  IndianRupee,
  Layers3,
  Lightbulb,
  TrendingDown,
  TrendingUp
} from "lucide-react";

const BASE_RATE = 6.5;
const PEAK_RATE = 8.5;
const MODERATE_RATE = 6.5;
const LOW_RATE = 4.5;

const SECTION_TABS = [
  { id: "summary", label: "Overview", icon: BatteryCharging },
  { id: "devices", label: "Devices", icon: Cpu },
  { id: "usage", label: "Usage Periods", icon: BarChart3 },
  { id: "insights", label: "Insights", icon: Lightbulb }
];

const DEVICE_VIEWS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" }
];

const formatValue = (value, decimals = 2) => Number(value || 0).toFixed(decimals);

const toRows = (series = []) =>
  [...series]
    .map((item) => ({
      label: item._id,
      energy: Number(item.totalEnergy || 0),
      peakLoad: Number(item.maxPower || item.avgPower || 0)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

const sumRows = (rows) => rows.reduce((acc, row) => acc + Number(row.energy || 0), 0);

const getWindowRows = (rows, size) => rows.slice(Math.max(0, rows.length - size));

const getWindowCard = (rows, rate) => {
  const energy = sumRows(rows);
  return {
    energy,
    cost: energy * rate,
    peakLoad: rows.reduce((max, row) => Math.max(max, Number(row.peakLoad || 0)), 0)
  };
};

const getTrendState = (currentCost, previousCost) => {
  if (!previousCost && currentCost > 0) {
    return { delta: 100, up: true, label: "higher than previous" };
  }

  if (!previousCost) {
    return { delta: 0, up: false, label: "no previous baseline" };
  }

  const delta = ((currentCost - previousCost) / previousCost) * 100;
  return {
    delta,
    up: delta > 0,
    label: delta > 0 ? "higher than previous" : delta < 0 ? "lower than previous" : "stable"
  };
};

const CostEstimationPanel = ({
  totalEnergy,
  totalCost,
  series = [],
  advancedCost,
  deviceCostBreakdown = [],
  selectedDeviceName,
  devices = []
}) => {
  const [activeSection, setActiveSection] = useState("summary");
  const [activeDeviceId, setActiveDeviceId] = useState("");
  const [activeView, setActiveView] = useState("daily");

  const peakEnergy = Number(advancedCost?.peakEnergy || 0);
  const shoulderEnergy = Number(advancedCost?.shoulderEnergy || 0);
  const offPeakEnergy = Number(advancedCost?.offPeakEnergy || 0);
  const peakRate = Number(advancedCost?.peakRate || PEAK_RATE);
  const shoulderRate = Number(advancedCost?.shoulderRate || MODERATE_RATE);
  const offPeakRate = Number(advancedCost?.offPeakRate || LOW_RATE);

  const timeCosts = {
    peakCost: peakEnergy * peakRate,
    shoulderCost: shoulderEnergy * shoulderRate,
    offPeakCost: offPeakEnergy * offPeakRate
  };

  useEffect(() => {
    if (deviceCostBreakdown.length && !activeDeviceId) {
      const selected =
        deviceCostBreakdown.find((device) => device.isSelected) ||
        deviceCostBreakdown[0];
      if (selected) {
        setActiveDeviceId(selected.deviceId);
      }
    }
  }, [activeDeviceId, deviceCostBreakdown]);

  const selectedDevice = useMemo(() => {
    if (activeDeviceId) {
      return (
        deviceCostBreakdown.find((device) => device.deviceId === activeDeviceId) ||
        deviceCostBreakdown[0] ||
        null
      );
    }
    return deviceCostBreakdown.find((device) => device.isSelected) || deviceCostBreakdown[0] || null;
  }, [activeDeviceId, deviceCostBreakdown]);

  const selectedRows = useMemo(() => {
    if (selectedDevice?.series?.length) {
      return toRows(selectedDevice.series);
    }
    return toRows(series);
  }, [selectedDevice, series]);

  const deviceWindows = useMemo(() => {
    const daily = getWindowCard(getWindowRows(selectedRows, 1), BASE_RATE);
    const weekly = getWindowCard(getWindowRows(selectedRows, 7), BASE_RATE);
    const monthly = getWindowCard(getWindowRows(selectedRows, 30), BASE_RATE);
    return { daily, weekly, monthly };
  }, [selectedRows]);

  const activeWindow = deviceWindows[activeView] || deviceWindows.daily;
  const previousWindow =
    activeView === "daily"
      ? deviceWindows.weekly.cost / 7
      : activeView === "weekly"
        ? deviceWindows.monthly.cost / 30
        : deviceWindows.weekly.cost;
  const trend = getTrendState(activeWindow.cost, previousWindow);

  const usageCards = [
    {
      label: "Peak usage",
      energy: peakEnergy,
      cost: timeCosts.peakCost,
      rate: peakRate,
      accent: "rose"
    },
    {
      label: "Moderate usage",
      energy: shoulderEnergy,
      cost: timeCosts.shoulderCost,
      rate: shoulderRate,
      accent: "amber"
    },
    {
      label: "Low usage",
      energy: offPeakEnergy,
      cost: timeCosts.offPeakCost,
      rate: offPeakRate,
      accent: "cyan"
    }
  ];

  const topUsage = [...usageCards].sort((a, b) => b.cost - a.cost)[0];

  const smartInsight = useMemo(() => {
    if (!selectedDevice) {
      return "Choose a device to view cost intelligence and savings suggestions.";
    }

    if (!activeWindow.cost) {
      return `${selectedDevice.name || selectedDevice.deviceId} has no measurable cost in the selected range yet. Keep monitoring active to build a stable baseline.`;
    }

    if (trend.up) {
      return `${selectedDevice.name || selectedDevice.deviceId} is trending ${formatValue(Math.abs(trend.delta), 1)}% above the previous window. The ${topUsage.label.toLowerCase()} bucket is the main cost driver, so shifting flexible loads away from it can cut spend.`;
    }

    return `${selectedDevice.name || selectedDevice.deviceId} is trending lower. Keep high-load tasks in low-usage windows and maintain the current operating pattern for further savings.`;
  }, [activeWindow.cost, selectedDevice, topUsage.label, trend.delta, trend.up]);

  const activeSectionButton = (id) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      activeSection === id
        ? "bg-blue-600 text-white shadow-sm"
        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
    }`;

  return (
    <section className="bg-gradient-to-b from-blue-50 to-slate-50 border border-blue-100 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
        <aside className="lg:w-64 bg-white/80 backdrop-blur border border-slate-200 rounded-xl p-3 sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Cost Estimation</p>
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={activeSectionButton(tab.id)}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Live trend</p>
            <div className={`mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${trend.up ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
              {trend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{formatValue(Math.abs(trend.delta), 1)}% {trend.label}</span>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          {activeSection === "summary" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cost Overview</p>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mt-1">Consumption and cost summary</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Tariff reference: ₹{BASE_RATE.toFixed(2)}/kWh with live updates from the current dashboard filters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <BatteryCharging size={16} />
                    <span className="text-xs font-medium uppercase tracking-wide">Total Energy Consumption</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{formatValue(totalEnergy)} kWh</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <IndianRupee size={16} />
                    <span className="text-xs font-medium uppercase tracking-wide">Total Cost</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">₹{formatValue(totalCost)}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "devices" && (
            <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers3 size={16} className="text-blue-600" />
                  <h4 className="text-sm font-semibold text-slate-800">Devices</h4>
                </div>
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {(deviceCostBreakdown.length ? deviceCostBreakdown : devices).map((device) => {
                    const deviceId = device.deviceId || device.id;
                    const isSelected = deviceId === (selectedDevice?.deviceId || activeDeviceId);

                    return (
                      <button
                        key={deviceId}
                        type="button"
                        onClick={() => setActiveDeviceId(deviceId)}
                        className={`w-full text-left rounded-lg border px-3 py-2 transition ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <p className={`text-sm font-medium truncate ${isSelected ? "text-blue-700" : "text-slate-700"}`}>{device.name || deviceId}</p>
                        <p className="text-xs text-slate-500 truncate">{device.type || "Device"}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Selected Device</p>
                    <h4 className="text-lg font-semibold text-slate-900 mt-1">{selectedDevice?.name || selectedDeviceName || "No device selected"}</h4>
                    <p className="text-sm text-slate-500 mt-1">{selectedDevice?.type || "Choose a device to compare daily, weekly, and monthly costs."}</p>
                  </div>
                  <div className="inline-flex rounded-lg bg-slate-100 p-1">
                    {DEVICE_VIEWS.map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setActiveView(view.id)}
                        className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium capitalize ${activeView === view.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "Daily", card: deviceWindows.daily },
                    { label: "Weekly", card: deviceWindows.weekly },
                    { label: "Monthly", card: deviceWindows.monthly }
                  ].map(({ label, card }) => (
                    <div
                      key={label}
                      className={`rounded-xl border p-4 ${activeView === label.toLowerCase() ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label} cost</p>
                      <p className="text-xl font-bold text-slate-900 mt-2">₹{formatValue(card.cost)}</p>
                      <p className="text-sm text-slate-600 mt-1">{formatValue(card.energy)} kWh</p>
                      <p className="text-xs text-slate-500 mt-2">Peak load: {formatValue(card.peakLoad, 0)} W</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "usage" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Time-based cost analysis</p>
                <h4 className="text-lg font-semibold text-slate-900 mt-1">Peak, moderate, and low usage periods</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {usageCards.map((item) => (
                  <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.accent === "rose" ? "bg-rose-100 text-rose-700" : item.accent === "amber" ? "bg-amber-100 text-amber-700" : "bg-cyan-100 text-cyan-700"}`}>
                          <Clock3 size={15} />
                        </div>
                        <h5 className="text-sm font-semibold text-slate-800">{item.label}</h5>
                      </div>
                      <span className="text-xs text-slate-500">₹{formatValue(item.rate)}/kWh</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full ${item.accent === "rose" ? "bg-rose-500" : item.accent === "amber" ? "bg-amber-500" : "bg-cyan-500"}`}
                        style={{ width: `${Math.min(100, (item.cost / Math.max(1, timeCosts.peakCost + timeCosts.shoulderCost + timeCosts.offPeakCost)) * 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Energy</p>
                        <p className="font-semibold text-slate-900 mt-1">{formatValue(item.energy)} kWh</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Cost</p>
                        <p className="font-semibold text-slate-900 mt-1">₹{formatValue(item.cost)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "insights" && (
            <div className="bg-white border border-blue-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Smart insight</p>
                  <p className="text-sm text-slate-600 mt-1">{smartInsight}</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Top time window</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{topUsage?.label || "Peak usage"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Selected device</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedDevice?.name || selectedDeviceName || "No device selected"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Savings tip</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">Move flexible loads to low-usage periods</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CostEstimationPanel;
