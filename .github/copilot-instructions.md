# Industrial IoT Multi-Device Monitoring Platform

## Project Overview

A scalable industrial-grade IoT energy monitoring system with:
- Real-time data visualization via WebSocket
- Multi-device comparison with radar charts
- Environmental impact analysis
- Control panel with alert thresholds
- 15-second ThingSpeak polling

## Tech Stack

### Backend
- Node.js + Express
- Socket.IO for WebSocket
- JWT authentication
- node-cron for polling
- nodemailer for email alerts
- ThingSpeak API integration

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion animations
- Recharts for visualization
- Lucide React icons

## Development

### Start Backend
```bash
cd backend
npm install
npm run dev
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Key Components

### Backend Services
- devicePollingService.js - 15-second ThingSpeak polling
- websocketService.js - Real-time push to clients
- alertService.js - Threshold monitoring, email alerts
- comparisonService.js - Multi-device metrics

### Frontend Pages
- Dashboard.jsx - Main monitoring interface with tabs
- Devices.jsx - Device management
- Reports.jsx - Export and reporting
- Login.jsx - Authentication

### Dashboard Tabs
1. Overview - KPIs, gauges, charts
2. Analytics - Advanced metrics
3. Control Panel - Device ON/OFF, thresholds
4. Comparison - Multi-device radar charts
5. Environmental - CO2 emissions, sustainability

## Environment Variables

See backend/.env.example and frontend/.env.example for required configuration.
