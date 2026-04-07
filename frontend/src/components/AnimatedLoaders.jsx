import React from "react";

export const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white border border-gray-200 p-6 rounded-lg ${className}`}>
    <div
      className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"
    />
    <div
      className="h-8 w-32 bg-gray-200 rounded mb-2 animate-pulse"
    />
    <div
      className="h-3 w-20 bg-gray-200 rounded animate-pulse"
    />
  </div>
);

export const SkeletonChart = ({ height = 200, className = "" }) => (
  <div className={`bg-white border border-gray-200 p-6 rounded-lg ${className}`}>
    <div
      className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"
    />
    <div className="flex items-end gap-2" style={{ height }}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-t animate-pulse"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

export const SkeletonGauge = ({ className = "" }) => (
  <div className={`bg-white border border-gray-200 p-6 rounded-lg ${className}`}>
    <div
      className="w-32 h-32 mx-auto rounded-full bg-gray-200 animate-pulse"
    />
    <div
      className="h-4 w-20 bg-gray-200 rounded mt-4 mx-auto animate-pulse"
    />
  </div>
);

export const SkeletonTable = ({ rows = 5, className = "" }) => (
  <div className={`bg-white border border-gray-200 p-6 rounded-lg ${className}`}>
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div
            className="h-4 flex-1 bg-gray-200 rounded animate-pulse"
          />
          <div
            className="h-4 w-20 bg-gray-200 rounded animate-pulse"
          />
        </div>
      ))}
    </div>
  </div>
);
