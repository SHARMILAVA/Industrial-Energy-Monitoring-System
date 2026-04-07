const express = require("express");
const { authRequired } = require("../middleware/auth");
const {
  summary,
  compare,
  predict,
  exportCsv,
  exportPdf
} = require("../controllers/analyticsController");

const router = express.Router();

router.use(authRequired);
router.get("/summary", summary);
router.get("/compare", compare);
router.get("/predict", predict);
router.get("/export", exportCsv);
router.get("/report/pdf", exportPdf);

module.exports = router;
