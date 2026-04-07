/**
 * Advanced Energy Analytics Calculations Service
 * 
 * This module implements advanced formulas for comprehensive energy analysis
 * All formulas are documented with their mathematical definitions and units
 */

/**
 * FORMULA 1: Power Factor
 * Definition: PF = Real Power (W) / Apparent Power (VA)
 * Range: 0 to 1 (1 = perfect efficiency)
 * Unit: Dimensionless (often shown as percentage)
 */
const calculatePowerFactor = (voltage, current, power) => {
  if (!voltage || !current) return 1.0;
  const apparentPower = voltage * current;
  if (apparentPower === 0) return 1.0;
  return Math.min(1.0, Math.max(0, power / apparentPower));
};

/**
 * FORMULA 2: Apparent Power (VA)
 * Definition: S = Voltage (V) × Current (A)
 * Unit: Volt-Amperes (VA)
 */
const calculateApparentPower = (voltage, current) => {
  return voltage * current;
};

/**
 * FORMULA 3: Reactive Power (VAR)
 * Definition: Q = √(S² - P²)
 * Where: S = Apparent Power (VA), P = Real Power (W)
 * Unit: Volt-Amperes Reactive (VAR)
 */
const calculateReactivePower = (voltage, current, power) => {
  const apparentPower = calculateApparentPower(voltage, current);
  const reactive = Math.sqrt(Math.max(0, apparentPower ** 2 - power ** 2));
  return reactive;
};

/**
 * FORMULA 4: Power Quality Index (PQI)
 * Definition: PQI = Power Factor × Load Factor × Efficiency
 * Range: 0 to 1 (1 = best quality)
 * Unit: Dimensionless (percentage)
 */
const calculatePowerQualityIndex = (powerFactor, loadFactor, efficiency) => {
  return powerFactor * loadFactor * (efficiency / 100);
};

/**
 * FORMULA 5: Load Factor
 * Definition: LF = Average Power / Peak Power × 100
 * Indicates how consistently the device operates at capacity
 * Range: 0 to 100%
 */
const calculateLoadFactor = (avgPower, maxPower) => {
  if (!maxPower || maxPower === 0) return 0;
  return (avgPower / maxPower) * 100;
};

/**
 * FORMULA 6: Efficiency (%)
 * Definition: Efficiency = (Avg Power / Max Power) × 100
 * Shows utilization rate of available capacity
 * Range: 0 to 100%
 */
const calculateEfficiency = (avgPower, maxPower) => {
  if (!maxPower || maxPower === 0) return 0;
  return (avgPower / maxPower) * 100;
};

/**
 * FORMULA 7: Daily Energy Consumption
 * Definition: E = Power (W) × Time (h) / 1000
 * Unit: Kilowatt-hours (kWh)
 */
const calculateDailyEnergy = (power, hoursOfOperation) => {
  return (power * hoursOfOperation) / 1000;
};

/**
 * FORMULA 8: Cost Analysis with Time-of-Use Tariff
 * Definition: Cost = ∑(Energy × Rate) for each time period
 * Supports peak, off-peak, and shoulder rates
 * Unit: Currency (typically USD)
 */
const calculateCostWithTariff = (rows) => {
  let totalCost = 0;
  let peakEnergy = 0;
  let offPeakEnergy = 0;
  let shoulderEnergy = 0;

  // Tamil Nadu TNEB Electricity Rates (INR per kWh)
  // Peak: 6PM-10PM (₹8.50/kWh) - High demand evening hours
  // Off-Peak: 10PM-6AM (₹4.50/kWh) - Night hours
  // Shoulder: 6AM-6PM (₹6.50/kWh) - Normal daytime hours
  const peakRate = 8.50;
  const offPeakRate = 4.50;
  const shoulderRate = 6.50;

  rows.forEach((row) => {
    const hour = new Date(row.timestamp).getHours();
    const energyKwh = (row.power / 1000) * (5 / 60); // Assuming 5-minute intervals
    
    if (hour >= 18 && hour < 22) {
      // Peak hours (6PM-10PM)
      peakEnergy += energyKwh;
      totalCost += energyKwh * peakRate;
    } else if (hour >= 22 || hour < 6) {
      // Off-peak (10PM-6AM)
      offPeakEnergy += energyKwh;
      totalCost += energyKwh * offPeakRate;
    } else {
      // Shoulder hours (6AM-6PM)
      shoulderEnergy += energyKwh;
      totalCost += energyKwh * shoulderRate;
    }
  });

  return {
    totalCost,
    peakEnergy,
    offPeakEnergy,
    shoulderEnergy,
    peakRate,
    offPeakRate,
    shoulderRate
  };
};

/**
 * FORMULA 9: Carbon Footprint Analysis
 * Definition: CO₂ = Energy (kWh) × Emission Factor (kg/kWh)
 * Emission Factor varies by region/energy mix
 * Unit: Kilograms of CO₂ equivalent (kg CO₂e)
 */
const calculateCarbonFootprint = (energy, emissionFactor = 0.82) => {
  return energy * emissionFactor;
};

/**
 * FORMULA 10: Peak Load Analysis
 * Definition: Peak Load = Maximum instantaneous power consumed
 * Demand Charge = Peak Load × Demand Rate ($/kW)
 * Unit: Watts (W) and Currency
 */
const calculatePeakLoadAnalysis = (rows, demandRate = 15) => {
  if (!rows.length) {
    return { peakLoad: 0, peakTime: null, demandCharge: 0 };
  }

  let peakLoad = 0;
  let peakTime = null;

  rows.forEach((row) => {
    if (row.power > peakLoad) {
      peakLoad = row.power;
      peakTime = row.timestamp;
    }
  });

  const demandCharge = (peakLoad / 1000) * demandRate; // Convert W to kW

  return { peakLoad, peakTime, demandCharge };
};

/**
 * FORMULA 11: Harmonic Distortion Index (HDI)
 * Definition: HDI = (THD * Power Factor) / 100
 * Indicates power quality issues (higher = worse quality)
 * Unit: Percentage
 * Note: Estimated based on reactive power ratio
 */
const calculateHarmonicDistortion = (reactivePower, apparentPower) => {
  if (!apparentPower || apparentPower === 0) return 0;
  const thd = (reactivePower / apparentPower) * 100;
  return Math.min(100, thd);
};

/**
 * FORMULA 12: Energy Consumption Trend
 * Definition: Uses linear regression to predict future consumption
 * y = mx + b, where x = time, y = power
 * Unit: Watts (W)
 */
const calculateConsumptionTrend = (rows) => {
  if (rows.length < 2) {
    return { slope: 0, intercept: 0, trend: "stable" };
  }

  const n = rows.length;
  const xMean = (n - 1) / 2;
  const yMean = rows.reduce((sum, r) => sum + r.power, 0) / n;

  let numerator = 0;
  let denominator = 0;

  rows.forEach((row, index) => {
    numerator += (index - xMean) * (row.power - yMean);
    denominator += (index - xMean) ** 2;
  });

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Determine trend
  let trend = "stable";
  if (slope > 50) trend = "increasing";
  else if (slope < -50) trend = "decreasing";

  return { slope, intercept, trend };
};

/**
 * FORMULA 13: Demand Response Potential
 * Definition: Savings = (Peak Load - Target Load) × Hours × Rate
 * Shows potential energy savings if demand is reduced
 * Unit: Currency or kWh
 */
const calculateDemandResponsePotential = (peakLoad, avgLoad, demandReductionTarget = 0.1) => {
  const targetLoad = peakLoad * (1 - demandReductionTarget);
  const potentialSavings = ((peakLoad - targetLoad) * 24) / 1000; // kWh per day
  const costSavings = potentialSavings * 0.18; // Assuming $0.18/kWh

  return {
    potentialSavings, // kWh/day
    costSavings,
    reductionPercentage: demandReductionTarget * 100,
    paybackPeriod: 0 // Can be calculated based on investment
  };
};

/**
 * FORMULA 14: Temperature Efficiency Impact
 * Definition: Efficiency reduces by ~2-3% for every 10°C increase above optimal
 * Used for thermal analysis of devices
 * Unit: Percentage points
 */
const calculateTemperatureImpact = (currentTemp, optimalTemp = 25) => {
  const tempDifference = currentTemp - optimalTemp;
  const efficiencyLoss = (tempDifference / 10) * 2.5;
  return {
    efficiencyLoss: Math.max(0, efficiencyLoss),
    thermalStatus: currentTemp > optimalTemp + 10 ? "high" : currentTemp > optimalTemp ? "moderate" : "optimal"
  };
};

/**
 * FORMULA 15: Comparative Analysis Between Devices
 * Definition: Returns performance metrics relative to peer devices
 * Unit: Performance index (lower = better)
 */
const calculateComparativeMetrics = (device1, device2) => {
  return {
    powerDifference: device1.avgPower - device2.avgPower,
    efficiencyDifference: device1.efficiency - device2.efficiency,
    costDifference: device1.estimatedCost - device2.estimatedCost,
    energyDifference: device1.totalEnergy - device2.totalEnergy
  };
};

// Comprehensive analysis aggregation
const buildAdvancedAnalytics = (rows, emissionFactor = 0.82) => {
  if (!rows.length) {
    return {
      basicStats: { avgPower: 0, maxPower: 0 },
      advancedMetrics: {}
    };
  }

  // Basic statistics
  const basicStats = {
    avgPower: rows.reduce((sum, r) => sum + r.power, 0) / rows.length,
    avgVoltage: rows.reduce((sum, r) => sum + r.voltage, 0) / rows.length,
    avgCurrent: rows.reduce((sum, r) => sum + r.current, 0) / rows.length,
    maxPower: Math.max(...rows.map((r) => r.power)),
    minPower: Math.min(...rows.map((r) => r.power)),
    maxVoltage: Math.max(...rows.map((r) => r.voltage)),
    minVoltage: Math.min(...rows.map((r) => r.voltage)),
    maxCurrent: Math.max(...rows.map((r) => r.current)),
    minCurrent: Math.min(...rows.map((r) => r.current)),
    avgTemp: rows.reduce((sum, r) => sum + r.temperature, 0) / rows.length,
    maxTemp: Math.max(...rows.map((r) => r.temperature)),
    minTemp: Math.min(...rows.map((r) => r.temperature)),
    totalEnergy: rows[rows.length - 1]?.energy || 0
  };

  // Advanced calculations
  const efficiency = calculateEfficiency(basicStats.avgPower, basicStats.maxPower);
  const loadFactor = calculateLoadFactor(basicStats.avgPower, basicStats.maxPower);
  const powerFactor = calculatePowerFactor(basicStats.avgVoltage, basicStats.avgCurrent, basicStats.avgPower);
  const apparentPower = calculateApparentPower(basicStats.avgVoltage, basicStats.avgCurrent);
  const reactivePower = calculateReactivePower(basicStats.avgVoltage, basicStats.avgCurrent, basicStats.avgPower);
  const pqi = calculatePowerQualityIndex(powerFactor, loadFactor / 100, efficiency);
  const hdi = calculateHarmonicDistortion(reactivePower, apparentPower);
  const carbonFootprint = calculateCarbonFootprint(basicStats.totalEnergy, emissionFactor);
  const peakLoadAnalysis = calculatePeakLoadAnalysis(rows);
  const consumptionTrend = calculateConsumptionTrend(rows);
  const demandResponse = calculateDemandResponsePotential(basicStats.maxPower, basicStats.avgPower);
  const costAnalysis = calculateCostWithTariff(rows);
  const tempImpact = calculateTemperatureImpact(basicStats.avgTemp);

  return {
    basicStats,
    advancedMetrics: {
      efficiency: Number(efficiency.toFixed(2)),
      loadFactor: Number(loadFactor.toFixed(2)),
      powerFactor: Number(powerFactor.toFixed(3)),
      apparentPower: Number(apparentPower.toFixed(2)),
      reactivePower: Number(reactivePower.toFixed(2)),
      powerQualityIndex: Number(pqi.toFixed(3)),
      harmonicDistortion: Number(hdi.toFixed(2)),
      carbonFootprint: Number(carbonFootprint.toFixed(2)),
      peakLoadAnalysis,
      consumptionTrend,
      demandResponsePotential: demandResponse,
      costAnalysis,
      temperatureImpact: tempImpact
    }
  };
};

module.exports = {
  calculatePowerFactor,
  calculateApparentPower,
  calculateReactivePower,
  calculatePowerQualityIndex,
  calculateLoadFactor,
  calculateEfficiency,
  calculateDailyEnergy,
  calculateCostWithTariff,
  calculateCarbonFootprint,
  calculatePeakLoadAnalysis,
  calculateHarmonicDistortion,
  calculateConsumptionTrend,
  calculateDemandResponsePotential,
  calculateTemperatureImpact,
  calculateComparativeMetrics,
  buildAdvancedAnalytics
};
