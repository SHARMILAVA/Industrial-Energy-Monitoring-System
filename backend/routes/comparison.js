/**
 * Comparison Routes
 * Handles device comparison API endpoints
 */

const express = require("express");
const router = express.Router();
const comparisonService = require("../services/comparisonService");
const { authRequired } = require("../middleware/auth");

/**
 * POST /api/comparison/devices
 * Compare two devices
 */
router.post("/devices", authRequired, async (req, res, next) => {
  try {
    const { deviceAId, deviceBId, from, to } = req.body;

    if (!deviceAId || !deviceBId) {
      return res.status(400).json({ 
        message: "Both deviceAId and deviceBId are required" 
      });
    }

    const comparison = await comparisonService.compareDevices(
      deviceAId,
      deviceBId,
      { from, to }
    );

    res.json(comparison);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/comparison/plant
 * Get plant-level aggregated metrics
 */
router.get("/plant", authRequired, async (req, res, next) => {
  try {
    const { deviceIds } = req.query;

    if (!deviceIds) {
      return res.status(400).json({ 
        message: "deviceIds query parameter is required" 
      });
    }

    const ids = deviceIds.split(",").map(id => id.trim());
    const plantMetrics = await comparisonService.getPlantMetrics(ids);

    res.json(plantMetrics);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/comparison/ranking
 * Get device ranking by consumption
 */
router.get("/ranking", authRequired, async (req, res, next) => {
  try {
    const { deviceIds, sortBy = "avgPower" } = req.query;

    if (!deviceIds) {
      return res.status(400).json({ 
        message: "deviceIds query parameter is required" 
      });
    }

    const ids = deviceIds.split(",").map(id => id.trim());
    const plantMetrics = await comparisonService.getPlantMetrics(ids);

    // Sort ranking by specified field
    const sortedRanking = plantMetrics.ranking.sort((a, b) => {
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });

    res.json({
      ranking: sortedRanking,
      plant: plantMetrics.plant
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
