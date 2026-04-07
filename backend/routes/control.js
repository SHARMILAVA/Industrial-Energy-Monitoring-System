const express = require("express");
const { authRequired } = require("../middleware/auth");
const {
	getControl,
	setManualControl,
	clearManualOverride,
	getTemperatureHistory
} = require("../controllers/controlController");

const router = express.Router();

router.use(authRequired);
router.get("/:deviceId", getControl);
router.post("/:deviceId/manual", setManualControl);
router.post("/:deviceId/auto", clearManualOverride);
router.get("/:deviceId/history", getTemperatureHistory);

module.exports = router;
