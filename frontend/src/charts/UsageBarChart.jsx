import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const UsageBarChart = ({ data }) => (
  <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
    <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Energy Usage</p>
    <div className="h-40 sm:h-52 mt-3 sm:mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} tick={{ fontSize: 10 }} />
          <YAxis stroke="#9ca3af" fontSize={10} tick={{ fontSize: 10 }} width={40} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default UsageBarChart;
