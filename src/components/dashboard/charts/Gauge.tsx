'use client'

import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

export interface GaugeChartProps {
  /** Current value (0-100 or custom max) */
  value: number
  /** Maximum value */
  max?: number
  /** Minimum value */
  min?: number
  /** Chart height in pixels */
  height?: number
  /** Title shown below the value */
  title?: string
  /** Unit suffix (%, $, etc.) */
  unit?: string
  /** Color or gradient stops */
  color?: string | { offset: number; color: string }[]
  /** Show axis ticks */
  showAxis?: boolean
  /** Gauge style variant */
  variant?: 'default' | 'progress' | 'meter'
  /** Class name for wrapper */
  className?: string
}

/**
 * GaugeChart - ECharts Gauge component for displaying progress/percentage
 */
export function GaugeChart({
  value,
  max = 100,
  min = 0,
  height = 200,
  title,
  unit = '%',
  color,
  showAxis = false,
  variant = 'default',
  className
}: GaugeChartProps) {
  // Calculate percentage for internal use
  const percentage = ((value - min) / (max - min)) * 100

  // Default colors based on percentage
  const getDefaultColor = () => {
    if (percentage >= 80) return '#52c41a' // Green
    if (percentage >= 60) return '#faad14' // Yellow
    if (percentage >= 40) return '#1890ff' // Blue
    return '#ff4d4f' // Red
  }

  // Build color config
  const colorConfig = color
    ? (typeof color === 'string'
        ? [[1, color]]
        : color.map(c => [c.offset, c.color]))
    : [
        [0.3, '#ff4d4f'],
        [0.7, '#faad14'],
        [1, '#52c41a']
      ]

  const getOption = () => {
    switch (variant) {
      case 'progress':
        // Ring progress style
        return {
          series: [
            {
              type: 'gauge',
              startAngle: 90,
              endAngle: -270,
              min,
              max,
              pointer: { show: false },
              progress: {
                show: true,
                overlap: false,
                roundCap: true,
                clip: false,
                itemStyle: {
                  color: typeof color === 'string' ? color : getDefaultColor()
                }
              },
              axisLine: {
                lineStyle: {
                  width: 12,
                  color: [[1, '#f0f0f0']]
                }
              },
              splitLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              anchor: { show: false },
              title: {
                show: !!title,
                fontSize: 12,
                color: '#6c757d',
                offsetCenter: [0, '70%']
              },
              detail: {
                valueAnimation: true,
                fontSize: 24,
                fontWeight: 600,
                color: '#344767',
                offsetCenter: [0, 0],
                formatter: `{value}${unit}`
              },
              data: [{ value, name: title || '' }]
            }
          ]
        }

      case 'meter':
        // Speedometer style
        return {
          series: [
            {
              type: 'gauge',
              min,
              max,
              splitNumber: 5,
              axisLine: {
                lineStyle: {
                  width: 15,
                  color: colorConfig
                }
              },
              pointer: {
                itemStyle: {
                  color: '#344767'
                },
                length: '60%',
                width: 6
              },
              axisTick: {
                distance: -15,
                length: 6,
                lineStyle: { color: '#fff', width: 1 }
              },
              splitLine: {
                distance: -15,
                length: 15,
                lineStyle: { color: '#fff', width: 2 }
              },
              axisLabel: {
                color: '#6c757d',
                distance: 25,
                fontSize: 10
              },
              anchor: {
                show: true,
                size: 15,
                itemStyle: { borderWidth: 2, borderColor: '#344767' }
              },
              title: {
                show: !!title,
                fontSize: 12,
                color: '#6c757d',
                offsetCenter: [0, '80%']
              },
              detail: {
                valueAnimation: true,
                fontSize: 20,
                fontWeight: 600,
                color: '#344767',
                offsetCenter: [0, '55%'],
                formatter: `{value}${unit}`
              },
              data: [{ value, name: title || '' }]
            }
          ]
        }

      default:
        // Default semi-circle gauge
        return {
          series: [
            {
              type: 'gauge',
              startAngle: 180,
              endAngle: 0,
              min,
              max,
              splitNumber: showAxis ? 5 : 0,
              axisLine: {
                lineStyle: {
                  width: 20,
                  color: colorConfig
                }
              },
              pointer: {
                itemStyle: { color: '#344767' },
                length: '55%',
                width: 4
              },
              axisTick: { show: showAxis, length: 8, lineStyle: { color: 'auto' } },
              splitLine: {
                show: showAxis,
                length: 12,
                lineStyle: { color: 'auto', width: 2 }
              },
              axisLabel: {
                show: showAxis,
                color: '#6c757d',
                fontSize: 10,
                distance: -40
              },
              anchor: {
                show: true,
                size: 12,
                itemStyle: { borderWidth: 2, borderColor: '#344767' }
              },
              title: {
                show: !!title,
                fontSize: 12,
                color: '#6c757d',
                offsetCenter: [0, '65%']
              },
              detail: {
                valueAnimation: true,
                fontSize: 22,
                fontWeight: 600,
                color: '#344767',
                offsetCenter: [0, '35%'],
                formatter: `{value}${unit}`
              },
              data: [{ value, name: title || '' }]
            }
          ]
        }
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <ReactECharts
        option={getOption()}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
