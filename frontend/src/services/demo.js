export const demoDevices = [
  {
    deviceId: "esp32-001",
    name: "Smart Bulb #1",
    location: "Living Room",
    type: "LED Bulb",
    thresholds: { power: 4200, temperature: 70 }
  },
  {
    deviceId: "esp32-002",
    name: "Smart Bulb #2",
    location: "Bedroom",
    type: "LED Bulb",
    thresholds: { power: 3800, temperature: 65 }
  }
];

export const demoLatest = {
  deviceId: "esp32-001",
  voltage: 220.5,
  current: 12.8,
  power: 2821.4,
  energy: 145.2,
  temperature: 44.3,
  timestamp: new Date().toISOString()
};

export const demoLatestDevice2 = {
  deviceId: "esp32-002",
  voltage: 220.2,
  current: 10.2,
  power: 2246.4,
  energy: 98.5,
  temperature: 39.8,
  timestamp: new Date().toISOString()
};

export const demoSummary = {
  stats: {
    avgPower: 2450.4,
    maxPower: 3250.9,
    avgVoltage: 220.4,
    avgCurrent: 11.2,
    totalEnergy: 145.2,
    minTemperature: 38.4,
    maxTemperature: 52.1,
    avgTemp: 44.5,
    minPower: 1200,
    maxCurrent: 15.2,
    minCurrent: 8.5
  },
  series: [
    { _id: "2026-02-13", avgPower: 2100, totalEnergy: 95, avgTemperature: 40 },
    { _id: "2026-02-14", avgPower: 2300, totalEnergy: 110, avgTemperature: 42 },
    { _id: "2026-02-15", avgPower: 2450, totalEnergy: 125, avgTemperature: 44 },
    { _id: "2026-02-16", avgPower: 2600, totalEnergy: 135, avgTemperature: 45 },
    { _id: "2026-02-17", avgPower: 2450, totalEnergy: 145, avgTemperature: 44 },
    { _id: "2026-02-18", avgPower: 2500, totalEnergy: 152, avgTemperature: 45 }
  ],
  efficiency: 75,
  carbonEstimate: 118.87
};

export const demoPrediction = { predictedPower: 2650.5 };
