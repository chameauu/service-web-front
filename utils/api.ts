import type {
  LoginResponse,
  RegisterResponse,
  User,
  DeviceRegistrationResponse,
} from "@/types/api"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

export async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  // Add authentication based on endpoint
  if (!headers["Authorization"]) {
    // Auth endpoints (login, register, logout) don't need authorization
    if (endpoint.startsWith("/auth/")) {
      // No authorization header for auth endpoints
    }
    // Device registration doesn't need authorization
    else if (endpoint === "/devices/register") {
      // No authorization header for device registration
    }
    // All other endpoints use admin token
    else {
      headers["Authorization"] = "admin test"
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API request failed" }))
    throw new Error(error.message || "API request failed")
  }

  return response.json()
}

export const api = {
  // Auth
  login: (usernameOrEmail: string, password: string) =>
    apiCall<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: usernameOrEmail, password }),
    }),
  register: (username: string, email: string, password: string) =>
    apiCall<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
  logout: async () => {
    try {
      await apiCall("/auth/logout", { method: "POST" })
    } finally {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userData")
    }
  },

  // Devices
  getDevices: (userId: string) => apiCall(`/devices/user/${userId}`),
  getDeviceStatus: (deviceId: string, userId?: string) => {
    const headers: Record<string, string> = {}
    if (userId) {
      headers["X-User-ID"] = userId
    }
    return apiCall(`/devices/${deviceId}/status`, { headers })
  },
  getAllDeviceStatuses: () => apiCall("/devices/statuses"),
  createDevice: (data: {
    name: string
    device_type: string
    user_id: number | string
    description?: string
    location?: string
  }) => {
    // Extract user_id and send it in header, not body
    const { user_id, ...deviceData } = data
    return apiCall<DeviceRegistrationResponse>("/devices/register", {
      method: "POST",
      headers: {
        "X-User-ID": user_id.toString(),
      },
      body: JSON.stringify(deviceData),
    })
  },
  updateDeviceConfig: (apiKey: string, data: {
    device_id: string
    status: string
    config?: Record<string, any>
  }) =>
    apiCall("/devices/config", {
      method: "PUT",
      headers: { "X-API-Key": apiKey },
      body: JSON.stringify(data),
    }),

  // Telemetry (requires device API key)
  getTelemetry: (deviceId: string, apiKey: string, params?: { start_time?: string; end_time?: string; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_time) queryParams.append("start_time", params.start_time)
    if (params?.end_time) queryParams.append("end_time", params.end_time)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    const query = queryParams.toString()
    return apiCall(`/telemetry/${deviceId}${query ? `?${query}` : ""}`, {
      headers: { "X-API-Key": apiKey },
    })
  },
  getLatestTelemetry: (deviceId: string, apiKey: string) => 
    apiCall(`/telemetry/${deviceId}/latest`, {
      headers: { "X-API-Key": apiKey },
    }),
  getAggregatedTelemetry: (deviceId: string, apiKey: string, params: {
    start_time: string
    end_time: string
    interval: string
    aggregation: string
  }) => {
    const queryParams = new URLSearchParams(params as any)
    return apiCall(`/telemetry/${deviceId}/aggregated?${queryParams.toString()}`, {
      headers: { "X-API-Key": apiKey },
    })
  },

  // Charts
  getCharts: (userId: string) => apiCall(`/charts?user_id=${userId}`),
  getChart: (chartId: string) => apiCall(`/charts/${chartId}`),
  getChartData: (chartId: string, params?: { start_time?: string; end_time?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_time) queryParams.append("start_time", params.start_time)
    if (params?.end_time) queryParams.append("end_time", params.end_time)
    const query = queryParams.toString()
    return apiCall(`/charts/${chartId}/data${query ? `?${query}` : ""}`)
  },
  createChart: (data: {
    name: string
    chart_type: string
    user_id: number | string
    description?: string
    config?: Record<string, any>
  }) => {
    // Backend expects 'type' not 'chart_type'
    const { chart_type, ...rest } = data
    return apiCall("/charts", {
      method: "POST",
      body: JSON.stringify({
        ...rest,
        type: chart_type
      }),
    })
  },
  updateChart: (chartId: string, data: {
    name?: string
    chart_type?: string
    description?: string
    config?: Record<string, any>
  }) =>
    apiCall(`/charts/${chartId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteChart: (chartId: string) =>
    apiCall(`/charts/${chartId}`, {
      method: "DELETE",
    }),
  addDeviceToChart: (chartId: string, deviceId: string) =>
    apiCall(`/charts/${chartId}/devices`, {
      method: "POST",
      body: JSON.stringify({ device_id: deviceId }),
    }),
  removeDeviceFromChart: (chartId: string, deviceId: string) =>
    apiCall(`/charts/${chartId}/devices/${deviceId}`, {
      method: "DELETE",
    }),
  addMeasurementToChart: (chartId: string, measurement: string, config?: Record<string, any>) =>
    apiCall(`/charts/${chartId}/measurements`, {
      method: "POST",
      body: JSON.stringify({ 
        measurement_name: measurement,
        display_name: config?.display_name || measurement,
        color: config?.color || "#3b82f6"
      }),
    }),
  removeMeasurementFromChart: (chartId: string, measurementId: string) =>
    apiCall(`/charts/${chartId}/measurements/${measurementId}`, {
      method: "DELETE",
    }),

  // Users
  getUsers: () => apiCall<{ status: string; users: User[]; meta: any }>("/users"),
  getUser: (userId: string) => apiCall<{ status: string; user: User }>(`/users/${userId}`),
  createUser: (data: {
    username: string
    email: string
    password: string
    role?: string
  }) =>
    apiCall("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (userId: string, data: {
    username?: string
    email?: string
    role?: string
  }) =>
    apiCall(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deactivateUser: (userId: string) =>
    apiCall(`/users/${userId}/deactivate`, {
      method: "PATCH",
    }),
  activateUser: (userId: string) =>
    apiCall(`/users/${userId}/activate`, {
      method: "PATCH",
    }),
  deleteUser: (userId: string) =>
    apiCall(`/users/${userId}`, {
      method: "DELETE",
    }),

  // Admin
  getAllDevices: () => apiCall("/admin/devices"),
  getAdminDevice: (deviceId: string) => apiCall(`/admin/devices/${deviceId}`),
  updateDeviceStatus: (deviceId: string, status: string) =>
    apiCall(`/admin/devices/${deviceId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteDevice: (deviceId: string) =>
    apiCall(`/admin/devices/${deviceId}`, {
      method: "DELETE",
    }),
  getAdminStats: () => apiCall("/admin/stats"),

  // Device Groups
  getGroups: (userId: string, includeDevices = false) => {
    const params = new URLSearchParams()
    if (includeDevices) params.append("include_devices", "true")
    return apiCall(`/groups?${params.toString()}`, {
      headers: { "X-User-ID": userId },
    })
  },
  getGroup: (groupId: string, userId: string, includeDevices = true) => {
    const params = new URLSearchParams()
    if (includeDevices) params.append("include_devices", "true")
    return apiCall(`/groups/${groupId}?${params.toString()}`, {
      headers: { "X-User-ID": userId },
    })
  },
  createGroup: (userId: string, data: {
    name: string
    description?: string
    color?: string
    icon?: string
  }) =>
    apiCall("/groups", {
      method: "POST",
      headers: { "X-User-ID": userId },
      body: JSON.stringify(data),
    }),
  updateGroup: (groupId: string, userId: string, data: {
    name?: string
    description?: string
    color?: string
    icon?: string
  }) =>
    apiCall(`/groups/${groupId}`, {
      method: "PUT",
      headers: { "X-User-ID": userId },
      body: JSON.stringify(data),
    }),
  deleteGroup: (groupId: string, userId: string) =>
    apiCall(`/groups/${groupId}`, {
      method: "DELETE",
      headers: { "X-User-ID": userId },
    }),
  addDeviceToGroup: (groupId: string, deviceId: number, userId: string) =>
    apiCall(`/groups/${groupId}/devices`, {
      method: "POST",
      headers: { "X-User-ID": userId },
      body: JSON.stringify({ device_id: deviceId }),
    }),
  removeDeviceFromGroup: (groupId: string, deviceId: string, userId: string) =>
    apiCall(`/groups/${groupId}/devices/${deviceId}`, {
      method: "DELETE",
      headers: { "X-User-ID": userId },
    }),
  getGroupDevices: (groupId: string, userId: string) =>
    apiCall(`/groups/${groupId}/devices`, {
      headers: { "X-User-ID": userId },
    }),
  bulkAddDevicesToGroup: (groupId: string, deviceIds: number[], userId: string) =>
    apiCall(`/groups/${groupId}/devices/bulk`, {
      method: "POST",
      headers: { "X-User-ID": userId },
      body: JSON.stringify({ device_ids: deviceIds }),
    }),
  getDeviceGroups: (deviceId: string, userId: string) =>
    apiCall(`/devices/${deviceId}/groups`, {
      headers: { "X-User-ID": userId },
    }),
}
