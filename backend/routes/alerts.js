const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const {
  listActive,
  listHistory,
  acknowledge,
  updateThresholds
} = require("../controllers/alertController");

const router = express.Router();

router.use(authRequired);
router.get("/active", listActive);
router.get("/history", listHistory);
router.post("/:id/ack", requireRole("admin"), acknowledge);
router.put("/thresholds/:deviceId", requireRole("admin"), updateThresholds);

module.exports = router;
