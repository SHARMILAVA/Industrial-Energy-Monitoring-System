import React, { useState } from "react";
import { 
  Plus, 
  Settings, 
  Zap, 
  Thermometer, 
  MapPin, 
  Server,
  ChevronDown,
  X,
  Check,
  AlertTriangle
} from "lucide-react";

const DEVICE_TYPES = [
  "LED Bulb",
  "Fluorescent Bulb",
  "Motor",
  "Industrial Heater",
  "Pump",
  "HVAC System",
  "Compressor",
  "Transformer",
  "Production Machine",
  "Smart Plug",
  "Refrigerator",
  "Air Conditioner",
  "Water Heater",
  "Solar Inverter",
  "Generator",
  "Other"
];

const DeviceManager = ({ devices, currentDevice, onDeviceSelect, onCreateDevice }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    deviceId: "",
    name: "",
    location: "",
    type: "LED Bulb",
    channelId: "",
    readKey: "",
    writeKey: "",
    ratedPower: 100,
    tariffRate: 0.18,
    emissionFactor: 0.82,
    peakDemandLimit: 5000,
    temperatureWarning: 60
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.location) {
      return;
    }

    setIsSubmitting(true);
    try {
      const devicePayload = {
        ...formData,
        deviceId: formData.deviceId || `device-${Date.now()}`
      };
      await onCreateDevice(devicePayload);
      setFormData({
        deviceId: "",
        name: "",
        location: "",
        type: "LED Bulb",
        channelId: "",
        readKey: "",
        writeKey: "",
        ratedPower: 100,
        tariffRate: 0.18,
        emissionFactor: 0.82,
        peakDemandLimit: 5000,
        temperatureWarning: 60
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create device:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDeviceData = devices.find((d) => d.deviceId === currentDevice);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Device Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {devices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => onDeviceSelect(device.deviceId)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
                currentDevice === device.deviceId
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                device.status === "active" ? "bg-green-400" : 
                device.status === "error" ? "bg-red-400" : "bg-yellow-400"
              }`} />
              <Server className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate max-w-[80px] sm:max-w-none">{device.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="sm:inline">Add Device</span>
        </button>
      </div>

      {/* Create Device Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Create New Device
            </h3>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Server className="w-4 h-4" />
                Basic Information
              </h4>
              
              <input
                type="text"
                name="deviceId"
                placeholder="Device ID (auto-generated if empty)"
                value={formData.deviceId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              
              <input
                type="text"
                name="name"
                placeholder="Device Name *"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  placeholder="Location *"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none appearance-none"
                >
                  {DEVICE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* ThingSpeak Integration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                ThingSpeak Integration
              </h4>
              
              <input
                type="text"
                name="channelId"
                placeholder="ThingSpeak Channel ID"
                value={formData.channelId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              
              <input
                type="text"
                name="readKey"
                placeholder="Read API Key"
                value={formData.readKey}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              
              <input
                type="text"
                name="writeKey"
                placeholder="Write API Key"
                value={formData.writeKey}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <input
                  type="number"
                  name="ratedPower"
                  placeholder="Rated Power (W)"
                  value={formData.ratedPower}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Tariff (₹/kWh)</label>
                  <input
                    type="number"
                    name="tariffRate"
                    step="0.50"
                    value={formData.tariffRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="6.50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Emission Factor</label>
                  <input
                    type="number"
                    name="emissionFactor"
                    step="0.01"
                    value={formData.emissionFactor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  Peak Demand Limit (W)
                </label>
                <input
                  type="number"
                  name="peakDemandLimit"
                  value={formData.peakDemandLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-red-500" />
                  Temperature Warning (°C)
                </label>
                <input
                  type="number"
                  name="temperatureWarning"
                  value={formData.temperatureWarning}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleCreate}
              disabled={isSubmitting || !formData.name || !formData.location}
              className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Device
                </>
              )}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current Device Info Card */}
      {currentDeviceData && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{currentDeviceData.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{currentDeviceData.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rated Power</p>
              <p className="text-sm font-medium text-orange-600 mt-1">{currentDeviceData.ratedPower || 100}W</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Tariff</p>
              <p className="text-sm font-medium text-purple-600 mt-1">₹{currentDeviceData.tariffRate || 6.50}/kWh</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${
                currentDeviceData.status === "active" ? "text-green-600" : "text-red-600"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  currentDeviceData.status === "active" ? "bg-green-500" : "bg-red-500"
                }`} />
                {currentDeviceData.status || "Active"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Control</p>
              <p className={`text-sm font-medium mt-1 ${
                currentDeviceData.controlState === "on" ? "text-green-600" : "text-gray-500"
              }`}>
                {currentDeviceData.controlState === "on" ? "ON" : "OFF"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManager;
