import React, { useEffect, useState } from "react";
import Filters from "../components/Filters";
import { fetchDevices } from "../services/device";
import { exportCsv, exportPdf, fetchSeries, fetchAdvancedAnalytics } from "../services/data";
import { toChartSeries } from "../utils/format";
import UsageBarChart from "../charts/UsageBarChart";

const Reports = () => {
  const [devices, setDevices] = useState([]);
  const [filters, setFilters] = useState({ deviceId: "", from: "", to: "" });
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const init = async () => {
      const list = await fetchDevices();
      setDevices(list);
      if (list.length) {
        setFilters((prev) => ({ ...prev, deviceId: list[0].deviceId }));
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!filters.deviceId) return;
    const load = async () => {
      const data = await fetchSeries(filters.deviceId, filters.from, filters.to);
      setSeries(toChartSeries(data.series, "totalEnergy"));
    };
    load();
  }, [filters]);

  const download = async () => {
    const response = await exportCsv(filters.deviceId, filters.from, filters.to);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "energy-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadPdf = async () => {
    const response = await exportPdf(filters.deviceId, filters.from, filters.to);
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "energy-report.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Filters value={filters} onChange={setFilters} devices={devices} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg sm:text-xl text-gray-900 font-semibold">Energy Reports</h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={downloadPdf}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-orange-600 text-white text-xs sm:text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={download}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
      <UsageBarChart data={series} />
      <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-lg">
        <p className="text-xs sm:text-sm text-gray-600">
          Use the filters to generate hourly, daily, and monthly reports. The export uses
          the same date range.
        </p>
      </div>
    </div>
  );
};

export default Reports;
