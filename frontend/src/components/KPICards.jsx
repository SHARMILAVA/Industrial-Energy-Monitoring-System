import React from "react";

const KPICards = ({ items }) => {
  const colorMap = {
    "text-cyan-300": "border-l-blue-500",
    "text-orange-300": "border-l-orange-500",
    "text-emerald-300": "border-l-green-500",
    "text-purple-300": "border-l-purple-500"
  };

  const textColorMap = {
    "text-cyan-300": "text-blue-600",
    "text-orange-300": "text-orange-600",
    "text-emerald-300": "text-green-600",
    "text-purple-300": "text-purple-600"
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const borderClass = colorMap[item.tone] || "border-l-blue-500";
        const textColor = textColorMap[item.tone] || "text-blue-600";
        return (
          <div
            key={item.label}
            className={`bg-white p-3 sm:p-5 rounded-lg border border-gray-200 border-l-4 ${borderClass} shadow-sm hover:shadow transition-shadow`}
          >
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
              {item.label}
            </p>
            <div className="flex items-end justify-between mt-2 sm:mt-3">
              <h3 className={`text-lg sm:text-2xl font-bold ${textColor} truncate`}>{item.value}</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2 truncate">{item.caption}</p>
          </div>
        );
      })}
    </div>
  );
};
export default KPICards;
