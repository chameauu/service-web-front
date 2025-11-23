import { describe, it, expect, beforeAll } from 'vitest'
import { api } from '../api'

/**
 * Integration tests for API endpoints
 * These tests require the backend server to be running
 * Run with: npm test -- api.integration.test.ts
 * 
 * To skip these tests in CI, use: npm test -- --exclude=integration
 */

const TEST_USER = {
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!',
}

let authToken: string
let userId: string // UUID string, not number
let userNumericId: number
let deviceId: number
let deviceApiKey: string
let chartId: number

describe('API Integration Tests', () => {
  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const response = await api.register(
        TEST_USER.username,
        TEST_USER.email,
        TEST_USER.password
      )

      expect(response).toHaveProperty('user')
      expect(response.user.email).toBe(TEST_USER.email)
      expect(response.user.username).toBe(TEST_USER.username)
      expect(response.user).toHaveProperty('user_id')

      // Backend uses user_id (UUID) as the auth identifier
      authToken = response.user.user_id
      userId = response.user.user_id // Use UUID, not numeric id
      userNumericId = response.user.id
      
      // Store user_id as auth token for subsequent requests
      localStorage.setItem('authToken', authToken)
    })

    it('should login with valid credentials', async () => {
      // Backend expects username, not email
      const response = await api.login(TEST_USER.username, TEST_USER.password)

      expect(response).toHaveProperty('user')
      expect(response.user.email).toBe(TEST_USER.email)
      expect(response.user.username).toBe(TEST_USER.username)
    })

    it('should fail login with invalid credentials', async () => {
      await expect(
        api.login(TEST_USER.email, 'wrongpassword')
      ).rejects.toThrow()
    })
  })

  describe('Device Management', () => {
    it('should create a new device', async () => {
      const deviceData = {
        name: `Test Device ${Date.now()}`, // Unique name
        device_type: 'temperature_sensor',
        user_id: userId, // UUID string
        description: 'A test temperature sensor',
        location: 'Test Lab',
      }

      const response = await api.createDevice(deviceData)

      expect(response).toHaveProperty('device')
      expect(response.device).toHaveProperty('id')
      expect(response.device).toHaveProperty('api_key')
      expect(response.device.device_type).toBe(deviceData.device_type)

      deviceId = response.device.id
      deviceApiKey = response.device.api_key
    })

    it('should get user devices', async () => {
      const response = await api.getDevices(userId) // UUID string

      expect(response).toHaveProperty('devices')
      expect(response).toHaveProperty('total_devices')
      expect(Array.isArray(response.devices)).toBe(true)
      expect(response.devices.length).toBeGreaterThan(0)
      
      const testDevice = response.devices.find((d: any) => d.id === deviceId)
      expect(testDevice).toBeDefined()
      expect(testDevice.device_type).toBe('temperature_sensor')
    })

    it('should get device status', async () => {
      const response = await api.getDeviceStatus(deviceId.toString())

      expect(response).toHaveProperty('device')
      expect(response.device).toHaveProperty('id')
      expect(response.device).toHaveProperty('status')
      expect(response.device.id).toBe(deviceId)
    })

    it('should update device configuration', async () => {
      const configData = {
        device_id: deviceId.toString(),
        status: 'active',
        config: {
          sampling_rate: 60,
          threshold: 25,
        },
      }

      const response = await api.updateDeviceConfig(deviceApiKey, configData)

      expect(response).toHaveProperty('message')
      expect(response).toHaveProperty('device')
    })
  })

  describe('Telemetry Data', () => {
    it('should get telemetry data for device', async () => {
      const response = await api.getTelemetry(deviceId.toString(), deviceApiKey)

      expect(response).toHaveProperty('device_id')
      expect(response).toHaveProperty('data')
      expect(Array.isArray(response.data)).toBe(true)
      // May be empty if no data has been sent yet
    })

    it('should get telemetry with time filter', async () => {
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const response = await api.getTelemetry(deviceId.toString(), deviceApiKey, {
        start_time: startTime,
        limit: 100,
      })

      expect(response).toHaveProperty('device_id')
      expect(response).toHaveProperty('data')
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should get latest telemetry', async () => {
      try {
        const response = await api.getLatestTelemetry(deviceId.toString(), deviceApiKey)
        
        expect(response).toHaveProperty('device_id')
        // May have message "No telemetry data found" if no data exists
        if (response.message) {
          expect(response.message).toContain('No telemetry')
        }
      } catch (error: any) {
        // It's okay if there's no telemetry data yet
        expect(error.message).toContain('No telemetry')
      }
    })
  })

  describe.skip('Chart Management', () => {
    it('should create a new chart', async () => {
      const chartData = {
        name: 'Test Chart',
        chart_type: 'line' as const,
        user_id: userId,
        description: 'A test chart',
        config: {
          showLegend: true,
          showGrid: true,
        },
      }

      const response = await api.createChart(chartData)

      expect(response).toHaveProperty('id')
      expect(response.name).toBe(chartData.name)
      expect(response.chart_type).toBe(chartData.chart_type)

      chartId = response.id
    })

    it('should get user charts', async () => {
      const charts = await api.getCharts(userId.toString())

      expect(Array.isArray(charts)).toBe(true)
      expect(charts.length).toBeGreaterThan(0)
      
      const testChart = charts.find((c: any) => c.id === chartId)
      expect(testChart).toBeDefined()
    })

    it('should get chart details', async () => {
      const chart = await api.getChart(chartId.toString())

      expect(chart).toHaveProperty('id')
      expect(chart.id).toBe(chartId)
      expect(chart.name).toBe('Test Chart')
    })

    it('should add device to chart', async () => {
      const response = await api.addDeviceToChart(
        chartId.toString(),
        deviceId.toString()
      )

      expect(response).toHaveProperty('message')
    })

    it('should add measurement to chart', async () => {
      const response = await api.addMeasurementToChart(
        chartId.toString(),
        'temperature',
        { color: '#ff0000' }
      )

      expect(response).toHaveProperty('message')
    })

    it('should get chart data', async () => {
      const chartData = await api.getChartData(chartId.toString())

      expect(chartData).toHaveProperty('chart_id')
      expect(chartData).toHaveProperty('labels')
      expect(chartData).toHaveProperty('datasets')
      expect(Array.isArray(chartData.labels)).toBe(true)
      expect(Array.isArray(chartData.datasets)).toBe(true)
    })

    it('should update chart', async () => {
      const updateData = {
        name: 'Updated Test Chart',
        description: 'Updated description',
      }

      const response = await api.updateChart(chartId.toString(), updateData)

      expect(response).toHaveProperty('id')
      expect(response.name).toBe(updateData.name)
    })

    it('should delete chart', async () => {
      const response = await api.deleteChart(chartId.toString())

      expect(response).toHaveProperty('message')
    })
  })

  describe('User Management', () => {
    it('should get all users', async () => {
      const response = await api.getUsers()

      expect(response).toHaveProperty('users')
      expect(Array.isArray(response.users)).toBe(true)
      expect(response.users.length).toBeGreaterThan(0)
      
      const testUser = response.users.find((u: any) => u.user_id === userId)
      expect(testUser).toBeDefined()
    })

    it('should get specific user', async () => {
      const response = await api.getUser(userId)

      expect(response).toHaveProperty('user')
      expect(response.user).toHaveProperty('user_id')
      expect(response.user.user_id).toBe(userId)
      expect(response.user.email).toBe(TEST_USER.email)
    })
  })

  describe('Admin Operations', () => {
    it('should get all devices (admin)', async () => {
      const response = await api.getAllDevices()

      expect(response).toHaveProperty('devices')
      expect(Array.isArray(response.devices)).toBe(true)
    })

    it('should get admin stats', async () => {
      const response = await api.getAdminStats()

      expect(response).toHaveProperty('status')
      expect(response).toHaveProperty('total_devices')
      expect(response).toHaveProperty('device_stats')
      expect(typeof response.total_devices).toBe('number')
    })
  })

  describe('Cleanup', () => {
    it('should delete test device', async () => {
      const response = await api.deleteDevice(deviceId.toString())

      expect(response).toHaveProperty('message')
    })

    it('should logout', async () => {
      await api.logout()

      // localStorage mock returns undefined, not null
      expect(localStorage.getItem('authToken')).toBeFalsy()
      expect(localStorage.getItem('userData')).toBeFalsy()
    })
  })
})
