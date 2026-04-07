const PDFDocument = require("pdfkit");

const renderKeyValue = (doc, label, value) => {
  doc
    .fontSize(10)
    .fillColor("#94a3b8")
    .text(label, { continued: true })
    .fillColor("#0f172a")
    .text(` ${value}`);
};

const buildPdfReport = ({ res, deviceId, rangeLabel, stats, rows }) => {
  const doc = new PDFDocument({ margin: 36, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=energy-report-${deviceId}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).fillColor("#0f172a").text("Industrial Energy Report");
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#64748b").text(`Device: ${deviceId}`);
  doc.fontSize(10).fillColor("#64748b").text(`Range: ${rangeLabel}`);
  doc.moveDown();

  doc.fontSize(12).fillColor("#0f172a").text("Summary");
  doc.moveDown(0.4);
  renderKeyValue(doc, "Average Power:", `${stats.avgPower.toFixed(2)} W`);
  renderKeyValue(doc, "Peak Power:", `${stats.maxPower.toFixed(2)} W`);
  renderKeyValue(doc, "Total Energy:", `${stats.totalEnergy.toFixed(2)} kWh`);
  renderKeyValue(doc, "Avg Voltage:", `${stats.avgVoltage.toFixed(2)} V`);
  renderKeyValue(doc, "Avg Current:", `${stats.avgCurrent.toFixed(2)} A`);
  renderKeyValue(
    doc,
    "Temperature Range:",
    `${stats.minTemperature.toFixed(2)} - ${stats.maxTemperature.toFixed(2)} C`
  );

  doc.moveDown();
  doc.fontSize(12).fillColor("#0f172a").text("Recent Readings (Top 200)");
  doc.moveDown(0.4);

  const header = [
    "Timestamp",
    "Voltage",
    "Current",
    "Power",
    "Energy",
    "Temp"
  ];

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a");
  doc.text(header.join(" | "));
  doc.font("Helvetica").fontSize(9).fillColor("#334155");

  rows.slice(0, 200).forEach((row) => {
    const line = [
      new Date(row.timestamp).toISOString(),
      row.voltage.toFixed(2),
      row.current.toFixed(2),
      row.power.toFixed(2),
      row.energy.toFixed(2),
      row.temperature.toFixed(2)
    ].join(" | ");

    doc.text(line);
  });

  doc.end();
};

module.exports = { buildPdfReport };
