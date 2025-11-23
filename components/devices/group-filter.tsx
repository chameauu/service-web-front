"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Filter, Plus, X } from "lucide-react"
import { api } from "@/utils/api"
import type { DeviceGroup } from "@/types/api"

interface GroupFilterProps {
  userId: string
  selectedGroupId: number | null
  onGroupSelect: (groupId: number | null) => void
  onCreateGroup: () => void
}

export function GroupFilter({ userId, selectedGroupId, onGroupSelect, onCreateGroup }: GroupFilterProps) {
  const [groups, setGroups] = useState<DeviceGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [userId])

  const fetchGroups = async () => {
    try {
      setIsLoading(true)
      const response = await api.getGroups(userId, false)
      setGroups(response.groups || [])
    } catch (error) {
      console.error("Failed to fetch groups:", error)
      // Backend not ready yet, show empty state
      setGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGroupClick = (groupId: number) => {
    if (selectedGroupId === groupId) {
      onGroupSelect(null) // Deselect if clicking the same group
    } else {
      onGroupSelect(groupId)
    }
    setIsOpen(false)
  }

  const handleClearFilter = () => {
    onGroupSelect(null)
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Filter Button */}
        <div className="relative inline-flex">
          <Button
            variant={selectedGroupId ? "default" : "outline"}
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {selectedGroup ? selectedGroup.name : "Filter by Group"}
          </Button>
          {selectedGroupId && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClearFilter()
              }}
              className="absolute -right-2 -top-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
              title="Clear filter"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Create Group Button */}
        <Button
          variant="outline"
          onClick={onCreateGroup}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Group
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading groups...</div>
            ) : groups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="mb-2">No groups yet</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    onCreateGroup()
                  }}
                >
                  Create First Group
                </Button>
              </div>
            ) : (
              <div className="py-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupClick(group.id)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      selectedGroupId === group.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {group.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      <span className="font-medium">{group.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {group.device_count} {group.device_count === 1 ? "device" : "devices"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
