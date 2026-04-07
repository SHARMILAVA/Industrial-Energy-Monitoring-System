import api from "./api";
import { demoLatest, demoPrediction, demoSummary } from "./demo";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export const fetchLatest = async (deviceId) => {
  if (DEMO_MODE) {
    return { ...demoLatest, deviceId };
  }
  const { data } = await api.get("/api/data/latest", { params: { deviceId } });
  return data;
};

export const fetchSeries = async (deviceId, from, to) => {
  if (DEMO_MODE) {
    return demoSummary;
  }
  const { data } = await api.get("/api/analytics/summary", {
    params: { deviceId, from, to }
  });
  return data;
};

export const fetchPrediction = async (deviceId) => {
  if (DEMO_MODE) {
    return demoPrediction;
  }
  const { data } = await api.get("/api/analytics/predict", { params: { deviceId } });
  return data;
};

export const fetchAdvancedAnalytics = async (deviceId, from, to) => {
  if (DEMO_MODE) {
    return {
      efficiency: 75,
      loadFactor: 68.5,
      powerFactor: 0.92,
      apparentPower: 2854.3,
      reactivePower: 892.5,
      powerQualityIndex: 0.58,
      harmonicDistortion: 12.5,
      carbonFootprint: 118.87,
      peakLoadAnalysis: {
        peakLoad: 3250.9,
        peakTime: "2026-02-18T15:45:00Z",
        demandCharge: 48.76
      },
      consumptionTrend: {
        slope: 35.2,
        intercept: 2100,
        trend: "increasing"
      },
      demandResponsePotential: {
        potentialSavings: 7.8,
        costSavings: 1.40,
        reductionPercentage: 10
      },
      costAnalysis: {
        totalCost: 26.14,
        peakEnergy: 45.2,
        offPeakEnergy: 78.5,
        shoulderEnergy: 21.5,
        peakRate: 0.20,
        offPeakRate: 0.10,
        shoulderRate: 0.15
      },
      temperatureImpact: {
        efficiencyLoss: 4.75,
        thermalStatus: "moderate"
      }
    };
  }
  try {
    const { data } = await api.get("/api/analytics/summary", {
      params: { deviceId, from, to }
    });
    console.log("Advanced analytics data received:", data.advanced);
    return data.advanced || {};
  } catch (err) {
    console.error("Error fetching advanced analytics:", err);
    return {};
  }
};

export const exportCsv = async (deviceId, from, to) =>
  DEMO_MODE
    ? { data: "deviceId,voltage,current,power,energy,temperature,timestamp" }
    : api.get("/api/analytics/export", {
        params: { deviceId, from, to },
        responseType: "blob"
      });

export const exportPdf = async (deviceId, from, to) =>
  DEMO_MODE
    ? { data: "PDF export is available when backend is connected." }
    : api.get("/api/analytics/report/pdf", {
        params: { deviceId, from, to },
        responseType: "blob"
      });
