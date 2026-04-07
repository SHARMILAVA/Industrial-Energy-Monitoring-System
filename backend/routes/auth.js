const express = require("express");
const { login, register, me } = require("../controllers/authController");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/register", authRequired, requireRole("admin"), register);
router.get("/me", authRequired, me);

module.exports = router;
