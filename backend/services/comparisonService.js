/**
 * Device Comparison Service
 * Comprehensive multi-device comparison with advanced metrics
 */

const devicePollingService = require("./devicePollingService");
const { buildAdvancedAnalytics } = require("./advancedCalculations");

class ComparisonService {
  constructor() {
    this.carbonFactor = Number(process.env.CARBON_EMISSION_FACTOR || 0.82);
    // Tamil Nadu TNEB electricity rate in INR (₹/kWh)
    this.tariffRate = Number(process.env.TARIFF_RATE || 6.50);
    this.currency = '₹'; // Indian Rupees
    this.state = 'Tamil Nadu';
  }

  /**
   * Compare two devices with comprehensive metrics
   */
  async compareDevices(deviceAId, deviceBId, options = {}) {
    const { from, to, results = 500 } = options;

    // Fetch data for both devices
    const [feedsA, feedsB] = await Promise.all([
      devicePollingService.fetchFeeds(deviceAId, { start: from, end: to, results }),
      devicePollingService.fetchFeeds(deviceBId, { start: from, end: to, results })
    ]);

    const dataA = feedsA.feeds || [];
    const dataB = feedsB.feeds || [];

    // Build analytics for both devices
    const analyticsA = this.buildDeviceAnalytics(dataA, deviceAId);
    const analyticsB = this.buildDeviceAnalytics(dataB, deviceBId);

    // Calculate differences
    const comparison = this.calculateComparison(analyticsA, analyticsB);

    return {
      deviceA: {
        deviceId: deviceAId,
        dataPoints: dataA.length,
        ...analyticsA
      },
      deviceB: {
        deviceId: deviceBId,
        dataPoints: dataB.length,
        ...analyticsB
      },
      comparison,
      metadata: {
        from,
        to,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Build comprehensive analytics for a device
   */
  buildDeviceAnalytics(data, deviceId) {
    if (!data.length) {
      return this.getEmptyAnalytics();
    }

    // Basic statistics
    const stats = this.calculateBasicStats(data);
    
    // Power metrics
    const powerMetrics = this.calculatePowerMetrics(data);
    
    // Energy and cost
    const energyCost = this.calculateEnergyCost(data);
    
    // Environmental impact
    const environmental = this.calculateEnvironmentalImpact(energyCost.totalEnergy);

    // Trend analysis
    const trend = this.calculateTrend(data);

    return {
      stats,
      powerMetrics,
      energyCost,
      environmental,
      trend
    };
  }

  /**
   * Calculate basic statistics
   */
  calculateBasicStats(data) {
    const powers = data.map(d => d.power);
    const voltages = data.map(d => d.voltage);
    const currents = data.map(d => d.current);
    const temperatures = data.map(d => d.temperature);

    return {
      avgPower: this.average(powers),
      maxPower: Math.max(...powers),
      minPower: Math.min(...powers.filter(p => p > 0)),
      avgVoltage: this.average(voltages),
      avgCurrent: this.average(currents),
      avgTemperature: this.average(temperatures),
      maxTemperature: Math.max(...temperatures),
      readingCount: data.length
    };
  }

  /**
   * Calculate power-related metrics
   */
  calculatePowerMetrics(data) {
    const avgPower = this.average(data.map(d => d.power));
    const maxPower = Math.max(...data.map(d => d.power));
    const avgVoltage = this.average(data.map(d => d.voltage));
    const avgCurrent = this.average(data.map(d => d.current));

    // Apparent power (VA)
    const apparentPower = avgVoltage * avgCurrent;
    
    // Power factor
    const powerFactor = apparentPower > 0 ? Math.min(1, avgPower / apparentPower) : 1;
    
    // Reactive power (VAR)
    const reactivePower = Math.sqrt(Math.max(0, apparentPower ** 2 - avgPower ** 2));
    
    // Load factor (%)
    const loadFactor = maxPower > 0 ? (avgPower / maxPower) * 100 : 0;
    
    // Efficiency (%)
    const efficiency = loadFactor; // Same calculation for this context
    
    // Power Quality Index
    const pqi = powerFactor * (loadFactor / 100) * (efficiency / 100);
    
    // Harmonic Distortion Index
    const hdi = apparentPower > 0 ? (reactivePower / apparentPower) * 100 : 0;

    // Find peak time
    let peakPower = 0;
    let peakTime = null;
    data.forEach(d => {
      if (d.power > peakPower) {
        peakPower = d.power;
        peakTime = d.timestamp;
      }
    });

    return {
      apparentPower,
      reactivePower,
      powerFactor,
      loadFactor,
      efficiency,
      powerQualityIndex: pqi,
      harmonicDistortion: hdi,
      peakPower,
      peakTime
    };
  }

  /**
   * Calculate energy and cost metrics
   */
  calculateEnergyCost(data) {
    // Estimate total energy from readings (assuming 15-second intervals)
    const intervalHours = 15 / 3600; // 15 seconds in hours
    let totalEnergy = 0;
    let peakEnergy = 0;
    let offPeakEnergy = 0;
    let shoulderEnergy = 0;

    // Tamil Nadu TNEB Electricity Rates (INR per kWh)
    // Peak: 6PM-10PM (high demand evening hours)
    // Off-Peak: 10PM-6AM (night hours)
    // Shoulder: 6AM-6PM (normal daytime hours)
    const peakRate = 8.50;      // ₹8.50/kWh peak rate
    const offPeakRate = 4.50;   // ₹4.50/kWh off-peak rate
    const shoulderRate = 6.50;  // ₹6.50/kWh shoulder/normal rate

    data.forEach(d => {
      const energyKwh = (d.power / 1000) * intervalHours;
      totalEnergy += energyKwh;

      const hour = new Date(d.timestamp).getHours();
      if (hour >= 18 && hour < 22) {
        // Peak hours (6PM-10PM) - Tamil Nadu high demand
        peakEnergy += energyKwh;
      } else if (hour >= 22 || hour < 6) {
        // Off-peak hours (10PM-6AM)
        offPeakEnergy += energyKwh;
      } else {
        // Shoulder hours (6AM-6PM)
        shoulderEnergy += energyKwh;
      }
    });

    const totalCost = (peakEnergy * peakRate) + (offPeakEnergy * offPeakRate) + (shoulderEnergy * shoulderRate);
    const flatRateCost = totalEnergy * this.tariffRate;

    return {
      totalEnergy,
      peakEnergy,
      offPeakEnergy,
      shoulderEnergy,
      totalCost,
      flatRateCost,
      currency: '₹',
      state: 'Tamil Nadu',
      costBreakdown: {
        peak: { energy: peakEnergy, rate: peakRate, cost: peakEnergy * peakRate, label: 'Peak (6PM-10PM)' },
        shoulder: { energy: shoulderEnergy, rate: shoulderRate, cost: shoulderEnergy * shoulderRate, label: 'Normal (6AM-6PM)' },
        offPeak: { energy: offPeakEnergy, rate: offPeakRate, cost: offPeakEnergy * offPeakRate, label: 'Off-Peak (10PM-6AM)' }
      }
    };
  }

  /**
   * Calculate environmental impact metrics
   */
  calculateEnvironmentalImpact(totalEnergy) {
    const co2Emissions = totalEnergy * this.carbonFactor;
    const treesRequired = co2Emissions / 21; // Avg tree absorbs 21kg CO2/year
    const carKmEquivalent = co2Emissions / 0.12; // Avg car emits 0.12kg CO2/km

    // Sustainability score (0-100)
    // Lower emissions per kWh = higher score
    const emissionEfficiency = Math.max(0, 100 - (this.carbonFactor * 100));
    
    return {
      co2Emissions,
      treesRequired: Math.ceil(treesRequired),
      carKmEquivalent,
      sustainabilityScore: Math.round(emissionEfficiency),
      greenEnergyBadge: emissionEfficiency > 80 ? "gold" : emissionEfficiency > 60 ? "silver" : "bronze"
    };
  }

  /**
   * Calculate consumption trend
   */
  calculateTrend(data) {
    if (data.length < 2) {
      return { slope: 0, trend: "stable", forecast: 0 };
    }

    const n = data.length;
    const powers = data.map(d => d.power);
    const xMean = (n - 1) / 2;
    const yMean = this.average(powers);

    let numerator = 0;
    let denominator = 0;

    powers.forEach((power, index) => {
      numerator += (index - xMean) * (power - yMean);
      denominator += (index - xMean) ** 2;
    });

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const forecast = Math.max(0, yMean + slope * 4); // Forecast 4 intervals ahead

    let trend = "stable";
    if (slope > 5) trend = "increasing";
    else if (slope < -5) trend = "decreasing";

    return {
      slope,
      trend,
      forecast,
      avgPower: yMean
    };
  }

  /**
   * Calculate comparison between two devices
   */
  calculateComparison(analyticsA, analyticsB) {
    const diff = (a, b) => a - b;
    const pctDiff = (a, b) => b !== 0 ? ((a - b) / b) * 100 : 0;

    return {
      power: {
        difference: diff(analyticsA.stats.avgPower, analyticsB.stats.avgPower),
        percentDifference: pctDiff(analyticsA.stats.avgPower, analyticsB.stats.avgPower),
        moreEfficient: analyticsA.stats.avgPower < analyticsB.stats.avgPower ? "deviceA" : "deviceB"
      },
      energy: {
        difference: diff(analyticsA.energyCost.totalEnergy, analyticsB.energyCost.totalEnergy),
        percentDifference: pctDiff(analyticsA.energyCost.totalEnergy, analyticsB.energyCost.totalEnergy)
      },
      cost: {
        difference: diff(analyticsA.energyCost.totalCost, analyticsB.energyCost.totalCost),
        percentDifference: pctDiff(analyticsA.energyCost.totalCost, analyticsB.energyCost.totalCost),
        cheaper: analyticsA.energyCost.totalCost < analyticsB.energyCost.totalCost ? "deviceA" : "deviceB"
      },
      efficiency: {
        deviceA: analyticsA.powerMetrics.efficiency,
        deviceB: analyticsB.powerMetrics.efficiency,
        difference: diff(analyticsA.powerMetrics.efficiency, analyticsB.powerMetrics.efficiency),
        better: analyticsA.powerMetrics.efficiency > analyticsB.powerMetrics.efficiency ? "deviceA" : "deviceB"
      },
      powerFactor: {
        deviceA: analyticsA.powerMetrics.powerFactor,
        deviceB: analyticsB.powerMetrics.powerFactor,
        difference: diff(analyticsA.powerMetrics.powerFactor, analyticsB.powerMetrics.powerFactor),
        better: analyticsA.powerMetrics.powerFactor > analyticsB.powerMetrics.powerFactor ? "deviceA" : "deviceB"
      },
      loadFactor: {
        deviceA: analyticsA.powerMetrics.loadFactor,
        deviceB: analyticsB.powerMetrics.loadFactor,
        difference: diff(analyticsA.powerMetrics.loadFactor, analyticsB.powerMetrics.loadFactor)
      },
      powerQualityIndex: {
        deviceA: analyticsA.powerMetrics.powerQualityIndex,
        deviceB: analyticsB.powerMetrics.powerQualityIndex,
        difference: diff(analyticsA.powerMetrics.powerQualityIndex, analyticsB.powerMetrics.powerQualityIndex),
        better: analyticsA.powerMetrics.powerQualityIndex > analyticsB.powerMetrics.powerQualityIndex ? "deviceA" : "deviceB"
      },
      carbon: {
        deviceA: analyticsA.environmental.co2Emissions,
        deviceB: analyticsB.environmental.co2Emissions,
        difference: diff(analyticsA.environmental.co2Emissions, analyticsB.environmental.co2Emissions),
        greener: analyticsA.environmental.co2Emissions < analyticsB.environmental.co2Emissions ? "deviceA" : "deviceB"
      },
      peakLoad: {
        deviceA: analyticsA.powerMetrics.peakPower,
        deviceB: analyticsB.powerMetrics.peakPower,
        difference: diff(analyticsA.powerMetrics.peakPower, analyticsB.powerMetrics.peakPower)
      }
    };
  }

  /**
   * Get empty analytics structure
   */
  getEmptyAnalytics() {
    return {
      stats: { avgPower: 0, maxPower: 0, minPower: 0, avgVoltage: 0, avgCurrent: 0, avgTemperature: 0, maxTemperature: 0, readingCount: 0 },
      powerMetrics: { apparentPower: 0, reactivePower: 0, powerFactor: 1, loadFactor: 0, efficiency: 0, powerQualityIndex: 0, harmonicDistortion: 0, peakPower: 0, peakTime: null },
      energyCost: { totalEnergy: 0, peakEnergy: 0, offPeakEnergy: 0, shoulderEnergy: 0, totalCost: 0, flatRateCost: 0 },
      environmental: { co2Emissions: 0, treesRequired: 0, carKmEquivalent: 0, sustainabilityScore: 0, greenEnergyBadge: "bronze" },
      trend: { slope: 0, trend: "stable", forecast: 0 }
    };
  }

  /**
   * Calculate average of array
   */
  average(arr) {
    if (!arr.length) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Get plant-level aggregated metrics
   */
  async getPlantMetrics(deviceIds) {
    const allAnalytics = [];

    for (const deviceId of deviceIds) {
      try {
        const feeds = await devicePollingService.fetchFeeds(deviceId, { results: 200 });
        const analytics = this.buildDeviceAnalytics(feeds.feeds || [], deviceId);
        allAnalytics.push({ deviceId, ...analytics });
      } catch (error) {
        console.error(`Failed to get metrics for ${deviceId}:`, error.message);
      }
    }

    // Aggregate plant-level metrics
    const totalPower = allAnalytics.reduce((sum, a) => sum + a.stats.avgPower, 0);
    const totalEnergy = allAnalytics.reduce((sum, a) => sum + a.energyCost.totalEnergy, 0);
    const totalCost = allAnalytics.reduce((sum, a) => sum + a.energyCost.totalCost, 0);
    const totalCO2 = allAnalytics.reduce((sum, a) => sum + a.environmental.co2Emissions, 0);

    // Rank devices by consumption
    const deviceRanking = allAnalytics
      .map(a => ({
        deviceId: a.deviceId,
        avgPower: a.stats.avgPower,
        totalEnergy: a.energyCost.totalEnergy,
        totalCost: a.energyCost.totalCost
      }))
      .sort((a, b) => b.avgPower - a.avgPower);

    return {
      plant: {
        totalPower,
        totalEnergy,
        totalCost,
        totalCO2,
        treesRequired: Math.ceil(totalCO2 / 21),
        deviceCount: deviceIds.length
      },
      devices: allAnalytics,
      ranking: deviceRanking
    };
  }
}

// Singleton instance
const comparisonService = new ComparisonService();

module.exports = comparisonService;
