const express = require("express");
const deviceAuth = require("../middleware/deviceAuth");
const { authRequired } = require("../middleware/auth");
const {
  ingestData,
  listData,
  latestData,
  streamLatest
} = require("../controllers/dataController");

const router = express.Router();

router.post("/", deviceAuth, ingestData);
router.get("/", authRequired, listData);
router.get("/latest", authRequired, latestData);
router.get("/stream", authRequired, streamLatest);

module.exports = router;
