import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, apiCall } from '../api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('apiCall', () => {
    it('should make a successful API call', async () => {
      const mockResponse = { data: 'test' }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiCall('/test')
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should include auth token in headers when available', async () => {
      const mockToken = 'test-token'
      ;(localStorage.getItem as any).mockReturnValue(mockToken)
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await apiCall('/test')
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      )
    })

    it('should throw error on failed request', async () => {
      const errorMessage = 'Request failed'
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      })

      await expect(apiCall('/test')).rejects.toThrow(errorMessage)
    })

    it('should handle JSON parse errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(apiCall('/test')).rejects.toThrow('API request failed')
    })
  })

  describe('Authentication API', () => {
    it('should call login endpoint with correct credentials', async () => {
      const username = 'testuser'
      const password = 'password123'
      const mockResponse = { status: 'success', message: 'Login successful', user: { id: 1, username, user_id: 'abc123' } }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.login(username, password)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username, password }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should call register endpoint with correct data', async () => {
      const username = 'testuser'
      const email = 'test@example.com'
      const password = 'password123'
      const mockResponse = { token: 'abc123', user: { id: 1, username, email } }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.register(username, email, password)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should clear auth token on logout', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      })
      
      await api.logout()
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/auth/logout',
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('userData')
    })
  })

  describe('Device API', () => {
    it('should get devices for a user', async () => {
      const userId = '123'
      const mockDevices = [{ id: 1, name: 'Device 1' }]
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices,
      })

      const result = await api.getDevices(userId)
      
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/v1/devices/user/${userId}`,
        expect.any(Object)
      )
      expect(result).toEqual(mockDevices)
    })

    it('should create a new device', async () => {
      const deviceData = { 
        name: 'New Device', 
        device_type: 'sensor',
        user_id: 1
      }
      const mockResponse = { id: 1, ...deviceData }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.createDevice(deviceData)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/devices/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(deviceData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should update device config', async () => {
      const deviceId = '123'
      const apiKey = 'test-api-key'
      const updateData = { 
        device_id: deviceId,
        status: 'active',
        config: { threshold: 25 }
      }
      const mockResponse = { message: 'Config updated', device: {} }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.updateDeviceConfig(apiKey, updateData)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/devices/config',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should delete a device', async () => {
      const deviceId = '123'
      const mockResponse = { message: 'Device deleted' }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.deleteDevice(deviceId)
      
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/v1/admin/devices/${deviceId}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Telemetry API', () => {
    it('should get telemetry data for a device', async () => {
      const deviceId = '123'
      const apiKey = 'test-api-key'
      const mockTelemetry = { device_id: deviceId, data: [{ timestamp: '2024-01-01', value: 25 }] }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTelemetry,
      })

      const result = await api.getTelemetry(deviceId, apiKey)
      
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/v1/telemetry/${deviceId}`,
        expect.any(Object)
      )
      expect(result).toEqual(mockTelemetry)
    })

    it('should get telemetry data with time filter', async () => {
      const deviceId = '123'
      const apiKey = 'test-api-key'
      const params = { 
        start_time: '2024-01-01T00:00:00Z',
        limit: 100
      }
      const mockTelemetry = { device_id: deviceId, data: [{ timestamp: '2024-01-01', value: 25 }] }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTelemetry,
      })

      const result = await api.getTelemetry(deviceId, apiKey, params)
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/telemetry/${deviceId}?`),
        expect.any(Object)
      )
      expect(result).toEqual(mockTelemetry)
    })
  })

  describe('Charts API', () => {
    it('should get charts for a user', async () => {
      const userId = '123'
      const mockCharts = [{ id: 1, name: 'Chart 1' }]
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharts,
      })

      const result = await api.getCharts(userId)
      
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/v1/charts?user_id=${userId}`,
        expect.any(Object)
      )
      expect(result).toEqual(mockCharts)
    })

    it('should create a new chart', async () => {
      const chartData = { 
        name: 'New Chart', 
        chart_type: 'line' as const,
        user_id: 1
      }
      const mockResponse = { id: 1, ...chartData }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.createChart(chartData)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/charts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(chartData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should get chart data', async () => {
      const chartId = '123'
      const mockData = { labels: [], datasets: [] }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await api.getChartData(chartId)
      
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/v1/charts/${chartId}/data`,
        expect.any(Object)
      )
      expect(result).toEqual(mockData)
    })

    it('should update a chart', async () => {
      const chartId = '123'
      const updateData = { name: 'Updated Chart' }
      const mockResponse = { id: chartId, ...updateData }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.updateChart(chartId, updateData)
      
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/v1/charts/${chartId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should delete a chart', async () => {
      const chartId = '123'
      const mockResponse = { message: 'Chart deleted' }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.deleteChart(chartId)
      
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/v1/charts/${chartId}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Admin API', () => {
    it('should get all users', async () => {
      const mockUsers = [{ id: 1, email: 'user@example.com' }]
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      })

      const result = await api.getUsers()
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/users',
        expect.any(Object)
      )
      expect(result).toEqual(mockUsers)
    })

    it('should get all devices', async () => {
      const mockDevices = [{ id: 1, name: 'Device 1' }]
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices,
      })

      const result = await api.getAllDevices()
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/admin/devices',
        expect.any(Object)
      )
      expect(result).toEqual(mockDevices)
    })
  })
})
