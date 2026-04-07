const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const {
  listDevices,
  createDevice,
  getDevice,
  updateDevice,
  rotateKey,
  deleteDevice,
  getDeviceTypes
} = require("../controllers/deviceController");

const router = express.Router();

router.use(authRequired, requireRole("admin"));
router.get("/", listDevices);
router.get("/types", getDeviceTypes);
router.post("/", createDevice);
router.get("/:deviceId", getDevice);
router.put("/:deviceId", updateDevice);
router.post("/:deviceId/rotate-key", rotateKey);
router.delete("/:deviceId", deleteDevice);

module.exports = router;
