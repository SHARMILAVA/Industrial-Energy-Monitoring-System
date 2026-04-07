const jwt = require("jsonwebtoken");

// Hardcoded JWT secret (must match authController.js)
const JWT_SECRET = "iot-dashboard-secret-key-2026";

const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { email: decoded.email, role: decoded.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

module.exports = { authRequired, requireRole };
