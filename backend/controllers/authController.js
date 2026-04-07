const jwt = require("jsonwebtoken");

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@iot.com";
const ADMIN_PASSWORD = "admin123";
const JWT_SECRET = "iot-dashboard-secret-key-2026";

const createToken = (user) =>
  jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "12h"
  });

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = { email: ADMIN_EMAIL, role: "admin" };
    const token = createToken(user);
    return res.json({ token, role: user.role, email: user.email });
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    return res.status(403).json({ message: "User registration disabled" });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  res.json({ email: req.user.email, role: req.user.role });
};

module.exports = { login, register, me };
