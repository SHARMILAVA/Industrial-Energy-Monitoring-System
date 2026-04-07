/**
 * WebSocket Service
 * Handles real-time communication between backend and frontend
 * Pushes live device readings and alerts to connected clients
 */

const { Server } = require("socket.io");
const devicePollingService = require("./devicePollingService");
const alertService = require("./alertService");

class WebSocketService {
  constructor() {
    this.io = null;
    this.clients = new Map();
    this.deviceSubscriptions = new Map();
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    this.setupPollingListeners();
    this.setupAlertListeners();

    console.log("WebSocket service initialized");
    return this.io;
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      this.clients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date().toISOString(),
        subscribedDevices: new Set()
      });

      // Send initial data
      socket.emit("connected", {
        message: "Connected to IoT Dashboard",
        serverTime: new Date().toISOString()
      });

      // Handle device subscription
      socket.on("subscribeDevice", (deviceId) => {
        this.subscribeToDevice(socket, deviceId);
      });

      socket.on("unsubscribeDevice", (deviceId) => {
        this.unsubscribeFromDevice(socket, deviceId);
      });

      // Handle request for latest readings
      socket.on("getLatestReadings", () => {
        const readings = devicePollingService.getAllLatestReadings();
        socket.emit("allReadings", readings);
      });

      // Handle request for alerts
      socket.on("getAlerts", (deviceId) => {
        const alerts = alertService.getActiveAlerts(deviceId);
        socket.emit("alerts", alerts);
      });

      // Handle alert acknowledgment
      socket.on("acknowledgeAlert", (alertId) => {
        const alert = alertService.acknowledgeAlert(alertId);
        if (alert) {
          this.io.emit("alertAcknowledged", alert);
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Subscribe socket to device updates
   */
  subscribeToDevice(socket, deviceId) {
    const client = this.clients.get(socket.id);
    if (client) {
      client.subscribedDevices.add(deviceId);
    }

    // Add to device subscription map
    if (!this.deviceSubscriptions.has(deviceId)) {
      this.deviceSubscriptions.set(deviceId, new Set());
    }
    this.deviceSubscriptions.get(deviceId).add(socket.id);

    socket.join(`device:${deviceId}`);
    console.log(`Socket ${socket.id} subscribed to device ${deviceId}`);

    // Send latest reading immediately
    const latestReading = devicePollingService.getLatestReading(deviceId);
    if (latestReading) {
      socket.emit("reading", { deviceId, reading: latestReading });
    }
  }

  /**
   * Unsubscribe socket from device updates
   */
  unsubscribeFromDevice(socket, deviceId) {
    const client = this.clients.get(socket.id);
    if (client) {
      client.subscribedDevices.delete(deviceId);
    }

    const subscribers = this.deviceSubscriptions.get(deviceId);
    if (subscribers) {
      subscribers.delete(socket.id);
    }

    socket.leave(`device:${deviceId}`);
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(socket) {
    const client = this.clients.get(socket.id);
    if (client) {
      client.subscribedDevices.forEach(deviceId => {
        const subscribers = this.deviceSubscriptions.get(deviceId);
        if (subscribers) {
          subscribers.delete(socket.id);
        }
      });
    }
    this.clients.delete(socket.id);
  }

  /**
   * Setup listeners for polling service events
   */
  setupPollingListeners() {
    devicePollingService.on("reading", ({ deviceId, reading }) => {
      // Emit to room
      this.io.to(`device:${deviceId}`).emit("reading", { deviceId, reading });
      
      // Also emit to all clients for dashboard updates
      this.io.emit("deviceReading", { deviceId, reading });
    });
  }

  /**
   * Setup listeners for alert service events
   */
  setupAlertListeners() {
    alertService.on("alert", (alert) => {
      // Emit to specific device room
      this.io.to(`device:${alert.deviceId}`).emit("newAlert", alert);
      
      // Emit to all for global alert display
      this.io.emit("alert", alert);
    });

    alertService.on("alertAcknowledged", (alert) => {
      this.io.emit("alertUpdate", alert);
    });

    alertService.on("alertsCleared", (deviceId) => {
      this.io.to(`device:${deviceId}`).emit("alertsCleared", deviceId);
    });
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  /**
   * Send message to specific device subscribers
   */
  sendToDevice(deviceId, event, data) {
    if (this.io) {
      this.io.to(`device:${deviceId}`).emit(event, data);
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedClients: this.clients.size,
      deviceSubscriptions: Object.fromEntries(
        Array.from(this.deviceSubscriptions.entries()).map(([deviceId, subs]) => [
          deviceId,
          subs.size
        ])
      )
    };
  }
}

// Singleton instance
const webSocketService = new WebSocketService();

module.exports = webSocketService;
