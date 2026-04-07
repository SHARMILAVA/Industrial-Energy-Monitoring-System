import React, { useEffect, useState } from "react";
import { createDevice, fetchDevices } from "../services/device";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ deviceId: "", name: "", location: "" });

  const load = async () => {
    const list = await fetchDevices();
    setDevices(list);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await createDevice({ ...form });
    setForm({ deviceId: "", name: "", location: "" });
    load();
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Register Device Form */}
      <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl text-gray-900 font-semibold">Register Device</h3>
        <form className="mt-3 sm:mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3" onSubmit={submit}>
          <input
            className="bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Device ID"
            value={form.deviceId}
            onChange={(event) => setForm({ ...form, deviceId: event.target.value })}
          />
          <input
            className="bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Device Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            className="bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:col-span-2 md:col-span-1"
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />
          <button
            type="submit"
            className="sm:col-span-2 md:col-span-3 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Register Device
          </button>
        </form>
      </div>

      {/* Devices List */}
      <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl text-gray-900 font-semibold mb-4">Registered Devices</h3>
        
        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {devices.map((device) => (
            <div key={device.deviceId} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{device.name}</h4>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-500">ID: <span className="text-gray-700">{device.deviceId}</span></p>
                <p className="text-gray-500">Location: <span className="text-gray-700">{device.location}</span></p>
                <p className="text-gray-500">Power: <span className="text-gray-700">{device.thresholds?.power || '-'}</span></p>
                <p className="text-gray-500">Temp: <span className="text-gray-700">{device.thresholds?.temperature || '-'}</span></p>
              </div>
            </div>
          ))}
          {devices.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No devices registered yet</p>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600 border-b border-gray-200">
              <tr>
                <th className="pb-3 font-medium">Device ID</th>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Power Threshold</th>
                <th className="pb-3 font-medium">Temp Threshold</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.deviceId} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 text-gray-900 font-medium">{device.deviceId}</td>
                  <td className="py-3 text-gray-700">{device.name}</td>
                  <td className="py-3 text-gray-700">{device.location}</td>
                  <td className="py-3 text-gray-700">{device.thresholds?.power || '-'}</td>
                  <td className="py-3 text-gray-700">{device.thresholds?.temperature || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {devices.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">No devices registered yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Devices;
