const toNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const requiredFields = (payload, fields) => {
  const missing = fields.filter((field) => payload[field] === undefined);
  return missing;
};

module.exports = { toNumber, requiredFields };
