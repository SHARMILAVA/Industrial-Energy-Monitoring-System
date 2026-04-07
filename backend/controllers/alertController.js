const { getThresholds, setThresholds } = require("../services/thresholds");

const alerts = [];

const listActive = async (req, res, next) => {
  try {
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

const listHistory = async (req, res, next) => {
  try {
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

const acknowledge = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json({ id, status: "acknowledged" });
  } catch (error) {
    next(error);
  }
};

const updateThresholds = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const updated = setThresholds(req.body.thresholds || {});
    res.json({ deviceId, thresholds: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { listActive, listHistory, acknowledge, updateThresholds };
