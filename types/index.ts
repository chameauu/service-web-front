export interface User {
  id: string
  username: string
  email: string
  role: "user" | "admin"
}

export interface Device {
  id: string
  name: string
  type: "Sensor" | "Actuator" | "Gateway" | "Controller"
  status: "online" | "offline" | "maintenance"
  location: string
  firmwareVersion: string
  hardwareVersion: string
  lastSeen: string
  ownerId: string
  description?: string
  apiKey?: string
  createdAt: string
}

export interface TelemetryData {
  id: string
  deviceId: string
  timestamp: string
  temperature?: number
  humidity?: number
  pressure?: number
  [key: string]: any
}

export interface Chart {
  id: string
  name: string
  description?: string
  type: "line" | "bar" | "area"
  timeRange: "1h" | "24h" | "7d" | "30d"
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ChartDevice {
  id: string
  chartId: string
  deviceId: string
}

export interface ChartMeasurement {
  id: string
  chartId: string
  name: string
  label: string
  color: string
  displayOrder: number
}
