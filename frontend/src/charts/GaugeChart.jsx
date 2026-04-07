import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const GaugeChart = ({ value, max, label, unit, color = "blue" }) => {
  const normalized = Math.min(value, max);
  const percentage = (normalized / max) * 100;
  const data = [
    { name: "value", value: normalized },
    { name: "rest", value: Math.max(0, max - normalized) }
  ];

  const colorMap = {
    cyan: { fill: "#3b82f6", text: "text-blue-600" },
    blue: { fill: "#3b82f6", text: "text-blue-600" },
    orange: { fill: "#f97316", text: "text-orange-600" },
    purple: { fill: "#8b5cf6", text: "text-purple-600" },
    green: { fill: "#10b981", text: "text-green-600" }
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white p-3 sm:p-5 rounded-lg border border-gray-200 flex flex-col items-center">
      <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="w-full max-w-[200px]">
        <PieChart width={200} height={120} className="mx-auto">
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            <Cell fill={theme.fill} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </div>
      <div className="-mt-8 sm:-mt-10 text-center">
        <p className={`text-xl sm:text-2xl font-bold ${theme.text}`}>{value.toFixed(1)}</p>
        <span className="text-[10px] sm:text-xs text-gray-500">{unit}</span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{percentage.toFixed(1)}% of {max}</p>
      </div>
    </div>
  );};

export default GaugeChart;
