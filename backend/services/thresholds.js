let thresholds = {
  power: Number(process.env.THRESHOLD_POWER || 4200),
  temperature: Number(process.env.THRESHOLD_TEMPERATURE || 70)
};

const getThresholds = () => thresholds;

const setThresholds = (next) => {
  thresholds = {
    power: Number(next.power ?? thresholds.power),
    temperature: Number(next.temperature ?? thresholds.temperature)
  };
  return thresholds;
};

module.exports = { getThresholds, setThresholds };
