const deviceAuth = async (req, res, next) => {
  const deviceId = req.body.deviceId || req.params.deviceId || req.query.deviceId;
  const deviceKey = req.headers["x-device-key"] || req.body.deviceKey;

  if (!deviceId || !deviceKey) {
    return res.status(401).json({ message: "Missing device credentials" });
  }

  const allowedKey = process.env.DEVICE_SECRET_KEY || process.env.THINGSPEAK_WRITE_KEY;
  if (deviceKey !== allowedKey) {
    return res.status(401).json({ message: "Invalid device credentials" });
  }

  req.device = { deviceId };
  return next();
};

module.exports = deviceAuth;
