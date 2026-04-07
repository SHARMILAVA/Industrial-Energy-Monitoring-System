import React from "react";

const AdvancedAnalytics = ({ data = {} }) => {
  const metrics = [
    {
      label: "Power Factor",
      value: (data.powerFactor || 0).toFixed(3),
      unit: "",
      color: "blue",
      description: "Ratio of real to apparent power (ideal: 1.0)"
    },
    {
      label: "Load Factor",
      value: (data.loadFactor || 0).toFixed(1),
      unit: "%",
      color: "blue",
      description: "Avg power / Peak power ratio"
    },
    {
      label: "Reactive Power",
      value: (data.reactivePower || 0).toFixed(0),
      unit: "VAR",
      color: "purple",
      description: "Non-productive power"
    },
    {
      label: "Apparent Power",
      value: (data.apparentPower || 0).toFixed(0),
      unit: "VA",
      color: "orange",
      description: "Total power (real + reactive)"
    },
    {
      label: "Harmonic Distortion",
      value: (data.harmonicDistortion || 0).toFixed(1),
      unit: "%",
      color: "red",
      description: "Power quality indicator (lower is better)"
    },
    {
      label: "Power Quality Index",
      value: (data.powerQualityIndex || 0).toFixed(3),
      unit: "",
      color: "green",
      description: "Overall quality score (0-1)"
    }
  ];

  const colorClasses = {
    blue: "border-l-blue-500 text-blue-600",
    purple: "border-l-purple-500 text-purple-600",
    orange: "border-l-orange-500 text-orange-600",
    red: "border-l-red-500 text-red-600",
    green: "border-l-green-500 text-green-600"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-blue-600 rounded-full" />
        <h3 className="text-lg font-semibold text-gray-900">Advanced Power Analytics</h3>
      </div>

      {/* Power Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className={`bg-white p-4 rounded-lg border border-gray-200 border-l-4 ${colorClasses[metric.color]}`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{metric.label}</p>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`text-xl font-bold ${colorClasses[metric.color].split(' ')[1]}`}>{metric.value}</span>
              <span className="text-sm text-gray-400">{metric.unit}</span>
            </div>
            <p className="text-xs text-gray-400">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Peak Load Analysis */}
      {data.peakLoadAnalysis && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Peak Load Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Peak Load</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {(data.peakLoadAnalysis.peakLoad / 1000).toFixed(2)} kW
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Peak Time</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {new Date(data.peakLoadAnalysis.peakTime).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Demand Charge</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                ₹{data.peakLoadAnalysis.demandCharge.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Consumption Trend */}
      {data.consumptionTrend && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Consumption Trend</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Trend Direction</p>
              <p className={`text-base font-semibold mt-1 ${
                data.consumptionTrend.trend === "increasing" ? "text-red-600" :
                data.consumptionTrend.trend === "decreasing" ? "text-green-600" :
                "text-blue-600"
              }`}>
                {data.consumptionTrend.trend.charAt(0).toUpperCase() + data.consumptionTrend.trend.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Slope (W/interval)</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {data.consumptionTrend.slope.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Baseline Power</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {(data.consumptionTrend.intercept / 1000).toFixed(2)} kW
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis */}
      {data.costAnalysis && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-base font-semibold text-gray-900 mb-4">
            Cost Analysis (₹ INR)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                ₹{data.costAnalysis.totalCost.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Peak Hours (6PM-10PM)</p>
              <div className="mt-1">
                <p className="text-sm font-semibold text-red-600">{data.costAnalysis.peakEnergy.toFixed(1)} kWh</p>
                <p className="text-xs text-gray-400">@ ₹{data.costAnalysis.peakRate}/kWh</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Normal (6AM-6PM)</p>
              <div className="mt-1">
                <p className="text-sm font-semibold text-orange-600">{data.costAnalysis.shoulderEnergy.toFixed(1)} kWh</p>
                <p className="text-xs text-gray-400">@ ₹{data.costAnalysis.shoulderRate}/kWh</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Off-Peak (10PM-6AM)</p>
              <div className="mt-1">
                <p className="text-sm font-semibold text-blue-600">{data.costAnalysis.offPeakEnergy.toFixed(1)} kWh</p>
                <p className="text-xs text-gray-400">@ ₹{data.costAnalysis.offPeakRate}/kWh</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demand Response Potential */}
      {data.demandResponsePotential && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Demand Response Potential</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Potential Savings</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {data.demandResponsePotential.potentialSavings.toFixed(1)} kWh/day
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost Savings</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                ₹{data.demandResponsePotential.costSavings.toFixed(2)}/day
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reduction Target</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {data.demandResponsePotential.reductionPercentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Temperature Impact */}
      {data.temperatureImpact && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Temperature Impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Thermal Status</p>
              <p className={`text-base font-semibold mt-1 ${
                data.temperatureImpact.thermalStatus === "high" ? "text-red-600" :
                data.temperatureImpact.thermalStatus === "moderate" ? "text-orange-600" :
                "text-green-600"
              }`}>
                {data.temperatureImpact.thermalStatus.charAt(0).toUpperCase() + data.temperatureImpact.thermalStatus.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Efficiency Loss</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {(data.temperatureImpact.efficiencyLoss ?? 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
