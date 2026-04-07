import React from "react";

const Filters = ({ value, onChange, devices }) => (
  <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-lg flex flex-col gap-3 sm:flex-row sm:items-end">
    <div className="flex-1 min-w-0">
      <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-600 font-medium">Device</label>
      <select
        value={value.deviceId}
        onChange={(event) => onChange({ ...value, deviceId: event.target.value })}
        className="w-full mt-1.5 sm:mt-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.name}
          </option>
        ))}
      </select>
    </div>
    <div className="flex gap-3 flex-1 sm:flex-none">
      <div className="flex-1 sm:flex-none">
        <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-600 font-medium">From</label>
        <input
          type="date"
          value={value.from}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
          className="w-full mt-1.5 sm:mt-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex-1 sm:flex-none">
        <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-600 font-medium">To</label>
        <input
          type="date"
          value={value.to}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
          className="w-full mt-1.5 sm:mt-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);

export default Filters;
