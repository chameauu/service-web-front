"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, Brush } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut } from "lucide-react"

interface TelemetryData {
  timestamp: string
  [key: string]: any // Allow dynamic measurement fields
}

interface TelemetryChartProps {
  data: TelemetryData[]
}

// Color palette for different measurements
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
]

// Custom tooltip for better interactivity
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TelemetryChart({ data }: TelemetryChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)

  // Prepare chart data with formatted time - sorted oldest to newest (left to right)
  const chartData = useMemo(() => 
    [...data]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((item) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleString("en-US", { 
          month: "short",
          day: "numeric",
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        fullTime: new Date(item.timestamp).toLocaleString(),
      })),
    [data]
  )

  // Dynamically detect all measurement fields
  const measurements = useMemo(() => {
    if (data.length === 0) return []
    
    const fields = new Set<string>()
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'timestamp' && typeof item[key] === 'number') {
          fields.add(key)
        }
      })
    })
    
    return Array.from(fields).map((field, index) => ({
      key: field,
      label: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: COLORS[index % COLORS.length],
      unit: getUnit(field)
    }))
  }, [data])

  // Get appropriate unit for measurement
  function getUnit(field: string): string {
    const fieldLower = field.toLowerCase()
    if (fieldLower.includes('temp')) return '°C'
    if (fieldLower.includes('humid')) return '%'
    if (fieldLower.includes('pressure')) return 'hPa'
    if (fieldLower.includes('voltage')) return 'V'
    if (fieldLower.includes('current')) return 'A'
    if (fieldLower.includes('power')) return 'W'
    return ''
  }

  // Toggle series visibility
  const toggleSeries = (key: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  // Export chart data as CSV
  const exportData = () => {
    const headers = ['Timestamp', ...measurements.map(m => m.label)]
    const rows = data.map(item => [
      item.timestamp,
      ...measurements.map(m => item[m.key] || '')
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `telemetry-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Reset zoom
  const resetZoom = () => {
    setZoomDomain(null)
  }

  if (data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        No data to display
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {measurements.map((measurement) => (
            <Button
              key={measurement.key}
              size="sm"
              variant={hiddenSeries.has(measurement.key) ? "outline" : "default"}
              onClick={() => toggleSeries(measurement.key)}
              className="text-xs"
              style={{
                backgroundColor: hiddenSeries.has(measurement.key) ? 'transparent' : measurement.color,
                borderColor: measurement.color,
                color: hiddenSeries.has(measurement.key) ? measurement.color : 'white'
              }}
            >
              {measurement.label}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {zoomDomain && (
            <Button size="sm" variant="outline" onClick={resetZoom}>
              <ZoomOut className="w-4 h-4 mr-1" />
              Reset Zoom
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              onClick={(e) => toggleSeries(e.dataKey as string)}
              iconType="line"
            />
            <Brush 
              dataKey="time" 
              height={30} 
              stroke="#3b82f6"
              fill="#eff6ff"
            />
            
            {measurements.map((measurement) => (
              !hiddenSeries.has(measurement.key) && (
                <Line
                  key={measurement.key}
                  type="monotone"
                  dataKey={measurement.key}
                  stroke={measurement.color}
                  strokeWidth={2}
                  name={`${measurement.label} ${measurement.unit}`}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  animationDuration={300}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        {measurements.map((measurement) => {
          const values = data.map(d => d[measurement.key]).filter(v => typeof v === 'number')
          if (values.length === 0) return null
          
          const avg = values.reduce((a, b) => a + b, 0) / values.length
          const min = Math.min(...values)
          const max = Math.max(...values)
          const latest = values[values.length - 1]
          
          return (
            <div key={measurement.key} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: measurement.color }}
                />
                <span className="text-sm font-medium text-gray-700">{measurement.label}</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Latest:</span>
                  <span className="font-semibold">{latest.toFixed(2)} {measurement.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg:</span>
                  <span>{avg.toFixed(2)} {measurement.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min/Max:</span>
                  <span>{min.toFixed(2)} / {max.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
