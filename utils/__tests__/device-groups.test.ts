import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from '../api'

describe('Device Groups API', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  describe('getGroups', () => {
    it('should fetch user groups without devices', async () => {
      const mockResponse = {
        status: 'success',
        groups: [
          {
            id: 1,
            name: 'Living Room',
            description: 'Living room devices',
            user_id: 1,
            color: '#FF5733',
            device_count: 3,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
          },
        ],
        meta: { total: 1, limit: 100, offset: 0 },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getGroups('user-123', false)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups?',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should fetch user groups with devices', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', groups: [] }),
      })

      await api.getGroups('user-123', true)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups?include_devices=true',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
        })
      )
    })
  })

  describe('createGroup', () => {
    it('should create a new group', async () => {
      const groupData = {
        name: 'Kitchen Devices',
        description: 'All kitchen sensors',
        color: '#33FF57',
      }

      const mockResponse = {
        status: 'success',
        message: 'Group created successfully',
        group: {
          id: 1,
          ...groupData,
          user_id: 1,
          device_count: 0,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.createGroup('user-123', groupData)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(groupData),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('addDeviceToGroup', () => {
    it('should add a device to a group', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Device added to group successfully',
        membership: {
          id: 1,
          group_id: 1,
          device_id: 5,
          added_at: '2024-01-15T11:00:00Z',
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.addDeviceToGroup('1', 5, 'user-123')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups/1/devices',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
          body: JSON.stringify({ device_id: 5 }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('removeDeviceFromGroup', () => {
    it('should remove a device from a group', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Device removed from group successfully',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.removeDeviceFromGroup('1', '5', 'user-123')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups/1/devices/5',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('bulkAddDevicesToGroup', () => {
    it('should add multiple devices to a group', async () => {
      const deviceIds = [1, 2, 3, 4, 5]
      const mockResponse = {
        status: 'success',
        message: '5 devices added to group',
        added: 5,
        skipped: 0,
        details: {
          added_device_ids: deviceIds,
          skipped_device_ids: [],
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.bulkAddDevicesToGroup('1', deviceIds, 'user-123')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups/1/devices/bulk',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
          body: JSON.stringify({ device_ids: deviceIds }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getDeviceGroups', () => {
    it('should fetch groups for a specific device', async () => {
      const mockResponse = {
        status: 'success',
        device_id: 1,
        device_name: 'Temperature Sensor 1',
        groups: [
          {
            id: 1,
            name: 'Living Room',
            color: '#FF5733',
            added_at: '2024-01-15T10:00:00Z',
          },
          {
            id: 2,
            name: 'Temperature Sensors',
            color: '#3357FF',
            added_at: '2024-01-15T11:00:00Z',
          },
        ],
        total_groups: 2,
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getDeviceGroups('1', 'user-123')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/devices/1/groups',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateGroup', () => {
    it('should update group details', async () => {
      const updateData = {
        name: 'Updated Living Room',
        description: 'Updated description',
        color: '#FF8C33',
      }

      const mockResponse = {
        status: 'success',
        message: 'Group updated successfully',
        group: {
          id: 1,
          ...updateData,
          user_id: 1,
          device_count: 3,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T12:00:00Z',
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.updateGroup('1', 'user-123', updateData)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups/1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteGroup', () => {
    it('should delete a group', async () => {
      const mockResponse = {
        status: 'success',
        message: "Group 'Living Room' deleted successfully",
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.deleteGroup('1', 'user-123')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/groups/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-User-ID': 'user-123',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
