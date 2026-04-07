const toCsv = (rows) => {
  const headers = [
    "deviceId",
    "voltage",
    "current",
    "power",
    "energy",
    "temperature",
    "timestamp"
  ];

  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === undefined || value === null) {
          return "";
        }
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...lines].join("\n");
};

module.exports = { toCsv };
