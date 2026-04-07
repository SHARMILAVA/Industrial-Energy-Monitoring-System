# Industrial IoT Multi-Device Monitoring Platform

A scalable industrial-grade IoT energy monitoring system with real-time data visualization, multi-device comparison, and environmental impact analysis.

## Features

- **Multi-Device Management**: Support for 16+ industrial device types (motors, heaters, pumps, HVAC, etc.)
- **Real-Time Monitoring**: 15-second ThingSpeak polling with WebSocket push
- **Device Comparison**: Radar charts, bar charts, and efficiency rankings
- **Environmental Impact**: CO₂ emissions, sustainability scores, green energy badges
- **Control Panel**: Device ON/OFF toggle, threshold configuration, live alerts
- **Advanced Analytics**: Efficiency metrics, cost analysis, demand forecasting
- **Animated UI**: Framer Motion animations with Lucide icons

## Project Structure

- **backend/**: Express API, JWT auth, ThingSpeak proxy, WebSocket, polling services
- **frontend/**: React + Vite + Tailwind + Framer Motion + Recharts

## Backend Setup

1) Copy `backend/.env.example` to `backend/.env` and fill values
2) Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3) Start the server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1) Copy `frontend/.env.example` to `frontend/.env` and update `VITE_API_URL`
2) Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3) Start the dashboard:
   ```bash
   npm run dev
   ```

## Core API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register` (admin only)
- `GET /api/auth/me`

### Devices
- `GET /api/devices`
- `GET /api/devices/types` - Get supported device types
- `POST /api/devices`
- `PUT /api/devices/:deviceId`
- `POST /api/devices/:deviceId/rotate-key`

### Data Ingestion
- `POST /api/data` (device auth)
- `GET /api/data`
- `GET /api/data/latest`
- `GET /api/data/stream`

### Analytics
- `GET /api/analytics/summary`
- `GET /api/analytics/compare`
- `GET /api/analytics/predict`
- `GET /api/analytics/export`
- `GET /api/analytics/report/pdf`

### Alerts
- `GET /api/alerts/active`
- `GET /api/alerts/history`
- `POST /api/alerts/:id/ack`
- `PUT /api/alerts/thresholds/:deviceId`

### Comparison
- `POST /api/comparison/devices` - Compare two devices
- `GET /api/comparison/plant` - Plant-level metrics
- `GET /api/comparison/ranking` - Device ranking

### Admin
- `GET /api/admin/dashboard` - Admin overview
- `GET /api/admin/alerts` - All alerts
- `GET/PUT /api/admin/settings` - System settings
- `POST /api/admin/thresholds/:deviceId` - Update thresholds

### Device Control
- `GET /api/device-control/:deviceId`

## Supported Device Types

- LED Bulb, Fluorescent Bulb
- Motor, Industrial Heater, Pump
- HVAC System, Compressor, Transformer
- Production Machine, Conveyor, CNC Machine
- Refrigeration Unit, Welding Machine
- Air Purifier, Server Rack

## Data Ingestion Payload

```json
POST /api/data
{
  "deviceId": "esp32-001",
  "voltage": 230.5,
  "current": 4.9,
  "power": 1139.4,
  "energy": 15.7,
  "temperature": 41.2,
  "timestamp": "2026-02-12T08:30:00Z"
}
```

Device authentication uses header `x-device-key` or body `deviceKey` (ThingSpeak Write API key).

## WebSocket Events

- `subscribe` - Subscribe to device updates
- `unsubscribe` - Unsubscribe from device
- `reading` - New device reading (push)
- `alert` - Alert triggered (push)

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - JWT signing secret
- `THINGSPEAK_CHANNEL_ID` - Primary device channel
- `THINGSPEAK_READ_KEY` - Read API key
- `THINGSPEAK_WRITE_KEY` - Write API key
- `CARBON_EMISSION_FACTOR` - kg CO₂ per kWh (default: 0.82)
- `TARIFF_RATE` - Cost per kWh (default: 0.18)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## ESP32 Example

See `esp32_example.ino` for a minimal ESP32 data post example using HTTPClient.
