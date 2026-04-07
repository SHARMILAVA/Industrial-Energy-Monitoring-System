import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from "recharts";
import {
  CalendarRange,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { fetchDevices } from "../services/device";
import { fetchAdvancedAnalytics, fetchSeries } from "../services/data";

const COST_PER_KWH = 6.5;
const PERIODS = ["daily", "weekly", "monthly"];

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;
const formatEnergy = (value) => `${Number(value || 0).toFixed(2)} kWh`;

const weekStartIso = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
};

const toMonthlyKey = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const suggestViewByRange = (from, to) => {
  if (!from || !to) return null;
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const diffMs = toDate.getTime() - fromDate.getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays <= 7) return "daily";
  if (diffDays <= 30) return "weekly";
  return "monthly";
};

const toDailyRows = (series = []) => {
  const sorted = [...series].sort((a, b) => a._id.localeCompare(b._id));

  return sorted.map((item, index) => {
    const prev = index > 0 ? Number(sorted[index - 1].totalEnergy || 0) : 0;
    const current = Number(item.totalEnergy || 0);
    const energy = index === 0 ? current : Math.max(0, current - prev);

    return {
      period: item._id,
      energy,
      cost: energy * COST_PER_KWH,
      peakLoad: Number(item.maxPower || item.avgPower || 0)
    };
  });
};

const aggregateRows = (rows, period) => {
  if (period === "daily") return rows;

  const grouped = new Map();

  rows.forEach((row) => {
    const key = period === "weekly" ? weekStartIso(row.period) : toMonthlyKey(row.period);
    const current = grouped.get(key) || { period: key, energy: 0, cost: 0, peakLoad: 0 };
    current.energy += row.energy;
    current.cost += row.cost;
    current.peakLoad = Math.max(current.peakLoad, row.peakLoad);
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).sort((a, b) => a.period.localeCompare(b.period));
};

const buildInsights = (dailyRows, advanced) => {
  if (!dailyRows.length) {
    return [
      "No historical records are available for the selected period.",
      "Connect devices and collect a few days of readings for trend intelligence.",
      "Use date filters to compare usage patterns once data is available."
    ];
  }

  const highestDay = dailyRows.reduce((acc, curr) => (curr.energy > acc.energy ? curr : acc), dailyRows[0]);
  const highestPeak = dailyRows.reduce((acc, curr) => (curr.peakLoad > acc.peakLoad ? curr : acc), dailyRows[0]);
  const peakTime = advanced?.peakLoadAnalysis?.peakTime
    ? new Date(advanced.peakLoadAnalysis.peakTime).toLocaleString()
    : "Not available";

  const peakRate = Number(advanced?.costAnalysis?.peakRate || 8.5);
  const offPeakRate = Number(advanced?.costAnalysis?.offPeakRate || 4.5);
  const recommendationSavings = Math.max(0, peakRate - offPeakRate) * 2;

  return [
    `Highest consumption day: ${highestDay.period} with ${formatEnergy(highestDay.energy)}.`,
    `Peak load occurred around ${peakTime}; highest daily peak was ${Number(highestPeak.peakLoad).toFixed(0)} W on ${highestPeak.period}.`,
    `Shift about 2 kWh of flexible usage from peak to off-peak windows to save approximately Rs ${recommendationSavings.toFixed(2)} per day.`
  ];
};

const HistoricalAnalysis = () => {
  const [devices, setDevices] = useState([]);
  const [filters, setFilters] = useState({ deviceId: "", from: "", to: "" });
  const [period, setPeriod] = useState("daily");
  const [summary, setSummary] = useState(null);
  const [advanced, setAdvanced] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const list = await fetchDevices();
        setDevices(list);

        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);

        if (list.length) {
          setFilters({
            deviceId: list[0].deviceId,
            from: fromDate.toISOString().slice(0, 10),
            to: today.toISOString().slice(0, 10)
          });
        }
      } catch (err) {
        console.error("Failed to initialize historical analysis:", err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!filters.deviceId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [summaryData, advancedData] = await Promise.all([
          fetchSeries(filters.deviceId, filters.from, filters.to),
          fetchAdvancedAnalytics(filters.deviceId, filters.from, filters.to)
        ]);

        setSummary(summaryData);
        setAdvanced(advancedData);
      } catch (err) {
        console.error("Failed to load historical analysis data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  useEffect(() => {
    const suggested = suggestViewByRange(filters.from, filters.to);
    if (suggested && suggested !== period) {
      setPeriod(suggested);
    }
  }, [filters.from, filters.to]);

  const dailyRows = useMemo(() => toDailyRows(summary?.series || []), [summary]);
  const periodRows = useMemo(() => aggregateRows(dailyRows, period), [dailyRows, period]);

  const insights = useMemo(() => buildInsights(dailyRows, advanced), [dailyRows, advanced]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">📊 Historical Analysis</h3>
        </div>
        <p className="text-sm text-gray-600">
          Analyze historical energy consumption and cost trends across daily, weekly, and monthly windows.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-end">
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-600 font-medium">Device</label>
            <select
              value={filters.deviceId}
              onChange={(event) => setFilters((prev) => ({ ...prev, deviceId: event.target.value }))}
              className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-600 font-medium">From Date</label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-600 font-medium">To Date</label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Select a date range and choose how you want to view the data.
        </p>

        <div className="pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarRange className="w-4 h-4 text-blue-600" />
              🗂️ View By
            </div>
            <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {PERIODS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                  period === item
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {item === "daily" ? "☀️ Daily" : item === "weekly" ? "📅 Weekly" : "🗓️ Monthly"}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            ⚡ Energy Usage Trend
          </h4>
          <div className="h-72">
            {periodRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={periodRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [formatEnergy(value), "Energy"]}
                    labelStyle={{ color: "#111827" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    name="Energy (kWh)"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm flex items-center justify-center">
                {loading ? "Loading data..." : "⚠️ No data available for selected date range"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            💰 Cost Variation
          </h4>
          <div className="h-72">
            {periodRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [formatCurrency(value), "Cost"]} />
                  <Legend />
                  <Bar dataKey="cost" name="Cost (Rs)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm flex items-center justify-center">
                {loading ? "Loading data..." : "⚠️ No data available for selected date range"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">📋 Historical Data Table</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date / Period</th>
                <th className="px-4 py-3 text-right font-medium">Energy (kWh)</th>
                <th className="px-4 py-3 text-right font-medium">Cost (Rs)</th>
                <th className="px-4 py-3 text-right font-medium">Peak Load (W)</th>
              </tr>
            </thead>
            <tbody>
              {periodRows.length ? (
                [...periodRows].reverse().slice(0, 50).map((row) => (
                  <tr key={row.period} className="border-t border-gray-100 hover:bg-blue-50/40">
                    <td className="px-4 py-2.5 text-gray-700">{row.period}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{row.energy.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{row.cost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{Number(row.peakLoad || 0).toFixed(0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    {loading ? "Loading historical data..." : "⚠️ No data available for selected date range"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-blue-700" />
          <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">💡 Smart Insights</h4>
        </div>
        <ul className="space-y-2">
          {insights.map((insight) => (
            <li key={insight} className="text-sm text-blue-900">
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistoricalAnalysis;
