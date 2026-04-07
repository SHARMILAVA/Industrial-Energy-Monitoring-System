export const formatNumber = (value, suffix = "") =>
  `${Number(value || 0).toFixed(2)}${suffix}`;

export const toChartSeries = (series, key, labelKey = "_id") =>
  (series || []).map((item) => ({
    label: item[labelKey],
    value: Number(item[key] || 0),
    avgPower: Number(item.avgPower || 0),
    avgTemperature: Number(item.avgTemperature || 0)
  }));
