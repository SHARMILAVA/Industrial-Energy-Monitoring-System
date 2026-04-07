import React, { useEffect, useState } from "react";
import DeviceControlPanel from "../components/DeviceControlPanel";
import { fetchDevices } from "../services/device";
import { ShieldCheck } from "lucide-react";

const AutomatedControl = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const list = await fetchDevices();
        setDevices(list || []);
      } catch (error) {
        console.error("Failed to load devices for automated control:", error);
      }
    };

    loadDevices();
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-700" /> Automated Control
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Intelligent overheat detection, automatic shutdown, and manual override controls.
        </p>
      </div>

      <DeviceControlPanel devices={devices} />
    </div>
  );
};

export default AutomatedControl;
