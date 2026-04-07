import api from "./api";

export const fetchControlStatus = async (deviceId) => {
  const { data } = await api.get(`/api/device-control/${deviceId}`);
  return data;
};

export const setManualRelay = async (deviceId, action) => {
  const { data } = await api.post(`/api/device-control/${deviceId}/manual`, { action });
  return data;
};

export const enableAutoSafety = async (deviceId) => {
  const { data } = await api.post(`/api/device-control/${deviceId}/auto`);
  return data;
};

export const fetchTemperatureHistory = async (deviceId, limit = 100) => {
  const { data } = await api.get(`/api/device-control/${deviceId}/history`, {
    params: { limit }
  });
  return data;
};
