import api from "./api";
import { demoDevices } from "./demo";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export const fetchDevices = async () => {
  if (DEMO_MODE) {
    return demoDevices;
  }
  const { data } = await api.get("/api/devices");
  return data;
};

export const createDevice = async (payload) => {
  if (DEMO_MODE) {
    return { ...payload, thresholds: { power: 4000, temperature: 70 } };
  }
  const { data } = await api.post("/api/devices", payload);
  return data;
};
