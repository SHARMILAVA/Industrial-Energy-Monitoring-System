import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const LineChartCard = ({ title, data, dataKey, stroke }) => (
  <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
    <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
    <div className="h-40 sm:h-52 mt-3 sm:mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} tick={{ fontSize: 10 }} />
          <YAxis stroke="#9ca3af" fontSize={10} tick={{ fontSize: 10 }} width={40} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={stroke || "#3b82f6"} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default LineChartCard;
