"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FolderPlus, Check, Plus } from "lucide-react"
import { api } from "@/utils/api"
import type { DeviceGroup } from "@/types/api"
import { CreateGroupModal } from "./create-group-modal"

interface AddToGroupButtonProps {
  deviceId: number
  userId: string
  onGroupsUpdated?: () => void
}

export function AddToGroupButton({ deviceId, userId, onGroupsUpdated }: AddToGroupButtonProps) {
  const [groups, setGroups] = useState<DeviceGroup[]>([])
  const [deviceGroups, setDeviceGroups] = useState<number[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch device groups on mount to show badge
  useEffect(() => {
    fetchDeviceGroups()
  }, [userId, deviceId])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, userId, deviceId])

  const fetchDeviceGroups = async () => {
    try {
      const deviceGroupsResponse = await api.getDeviceGroups(deviceId.toString(), userId).catch(() => ({ groups: [] }))
      setDeviceGroups(deviceGroupsResponse.groups?.map((g: any) => g.id) || [])
    } catch (error) {
      console.error("Failed to fetch device groups:", error)
      setDeviceGroups([])
    }
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [groupsResponse, deviceGroupsResponse] = await Promise.all([
        api.getGroups(userId, false).catch(() => ({ groups: [] })),
        api.getDeviceGroups(deviceId.toString(), userId).catch(() => ({ groups: [] })),
      ])
      
      setGroups(groupsResponse.groups || [])
      setDeviceGroups(deviceGroupsResponse.groups?.map((g: any) => g.id) || [])
    } catch (error) {
      console.error("Failed to fetch groups:", error)
      setGroups([])
      setDeviceGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleGroup = async (groupId: number) => {
    const isInGroup = deviceGroups.includes(groupId)
    
    try {
      if (isInGroup) {
        await api.removeDeviceFromGroup(groupId.toString(), deviceId.toString(), userId)
        setDeviceGroups(prev => prev.filter(id => id !== groupId))
      } else {
        await api.addDeviceToGroup(groupId.toString(), deviceId, userId)
        setDeviceGroups(prev => [...prev, groupId])
      }
      
      // Update the badge count
      fetchDeviceGroups()
      onGroupsUpdated?.()
    } catch (error) {
      console.error("Failed to toggle group:", error)
      alert(error instanceof Error ? error.message : "Failed to update group")
    }
  }

  const handleCreateGroup = () => {
    setIsOpen(false)
    setIsCreateModalOpen(true)
  }

  const handleGroupCreated = () => {
    fetchData()
    fetchDeviceGroups()
    onGroupsUpdated?.()
  }

  const groupCount = deviceGroups.length

  return (
    <>
      <Button
        variant={groupCount > 0 ? "default" : "outline"}
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 relative"
      >
        <FolderPlus className="w-4 h-4" />
        Groups
        {groupCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-white text-blue-600">
            {groupCount}
          </span>
        )}
      </Button>

      {/* Groups Management Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Device Groups</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Loading groups...
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateGroup}
                    className="w-full justify-start gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Group
                  </Button>
                </div>

                {groups.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FolderPlus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="mb-4">No groups yet</p>
                    <Button onClick={handleCreateGroup}>
                      Create Your First Group
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {groups.map((group) => {
                      const isInGroup = deviceGroups.includes(group.id)
                      return (
                        <button
                          key={group.id}
                          onClick={() => handleToggleGroup(group.id)}
                          className={`w-full p-3 rounded-lg border-2 transition-all hover:bg-gray-50 flex items-center justify-between ${
                            isInGroup ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {group.color && (
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: group.color }}
                              />
                            )}
                            <div className="text-left">
                              <div className="font-medium">{group.name}</div>
                              {group.description && (
                                <div className="text-sm text-gray-500">{group.description}</div>
                              )}
                            </div>
                          </div>
                          {isInGroup && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        userId={userId}
        onGroupCreated={handleGroupCreated}
      />
    </>
  )
}
