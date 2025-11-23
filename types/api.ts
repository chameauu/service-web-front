// Authentication Types
export interface LoginResponse {
  status: string
  message: string
  user: User
}

export interface RegisterResponse {
  status: string
  message: string
  user: User
}

// User Types
export interface User {
  id: number
  user_id: string
  username: string
  email: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  last_login?: string | null
}

// Device Types
export interface Device {
  id: number
  name: string
  device_type: string
  user_id: number
  description?: string
  location?: string
  status: 'active' | 'inactive' | 'error'
  firmware_version?: string
  hardware_version?: string
  last_seen?: string
  created_at: string
  updated_at?: string
  api_key?: string
}

export interface DeviceRegistrationResponse {
  message: string
  device: Device & { api_key: string }
}

export interface DeviceStatus {
  device_id: number
  status: 'online' | 'offline' | 'error'
  last_heartbeat: string
  uptime?: number
}

export interface CreateDeviceRequest {
  name: string
  device_type: string
  user_id: number
  description?: string
  location?: string
}

// Telemetry Types
export interface TelemetryData {
  id: number
  device_id: number
  timestamp: string
  measurements: Record<string, number | string | boolean>
}

export interface LatestTelemetry {
  device_id: number
  timestamp: string
  measurements: Record<string, number | string | boolean>
}

export interface AggregatedTelemetry {
  device_id: number
  measurement: string
  interval: string
  data: Array<{
    timestamp: string
    value: number
    count: number
    min?: number
    max?: number
    avg?: number
  }>
}

// Chart Types
export interface Chart {
  id: number
  name: string
  chart_type: 'line' | 'bar' | 'area' | 'scatter'
  user_id: number
  description?: string
  config?: Record<string, any>
  devices?: number[]
  measurements?: ChartMeasurement[]
  created_at: string
  updated_at?: string
}

export interface ChartMeasurement {
  id: number
  chart_id: number
  measurement: string
  config?: Record<string, any>
}

export interface ChartData {
  chart_id: number
  labels: string[]
  datasets: Array<{
    label: string
    device_id: number
    device_name: string
    measurement: string
    data: number[]
    color?: string
  }>
}

export interface CreateChartRequest {
  name: string
  chart_type: 'line' | 'bar' | 'area' | 'scatter'
  user_id: number
  description?: string
  config?: Record<string, any>
}

// Admin Types
export interface AdminStats {
  total_users: number
  total_devices: number
  active_devices: number
  total_telemetry_records: number
  total_charts: number
}

// Device Group Types
export interface DeviceGroup {
  id: number
  name: string
  description?: string
  user_id: number
  color?: string
  icon?: string
  device_count: number
  created_at: string
  updated_at: string
  devices?: Device[]
}

export interface DeviceGroupMember {
  id: number
  group_id: number
  device_id: number
  added_at: string
  added_by?: number
}

export interface CreateGroupRequest {
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface AddDeviceToGroupRequest {
  device_id: number
}

export interface BulkAddDevicesRequest {
  device_ids: number[]
}

// API Error Types
export interface ApiError {
  message: string
  code?: string
  details?: any
}
