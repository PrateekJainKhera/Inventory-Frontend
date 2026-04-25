'use client'

import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

export interface AreaChartDataItem {
  [key: string]: string | number
}

export interface AreaChartSeries {
  key: string
  name: string
  color?: string
}

export interface AreaChartProps {
  data: AreaChartDataItem[]
  xKey: string
  series: AreaChartSeries[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  smooth?: boolean
  className?: string
}

/**
 * AreaChart - ECharts Area Chart component
 */
export function AreaChart({
  data,
  xKey,
  series,
  height = 300,
  showLegend = true,
  showGrid = true,
  smooth = true,
  className
}: AreaChartProps) {
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e9ecef',
      borderWidth: 1,
      textStyle: {
        color: '#344767',
        fontSize: 12
      }
    },
    legend: showLegend ? {
      bottom: 0,
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
        color: '#6c757d'
      }
    } : undefined,
    grid: {
      top: 20,
      right: 20,
      bottom: showLegend ? 40 : 20,
      left: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item[xKey]),
      axisLine: { lineStyle: { color: '#dee2e6' } },
      axisLabel: { color: '#6c757d', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#6c757d', fontSize: 11 },
      splitLine: {
        show: showGrid,
        lineStyle: { color: '#f0f0f0', type: 'dashed' }
      }
    },
    series: series.map((s, index) => {
      const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
      const color = s.color || colors[index % colors.length]

      return {
        name: s.name,
        type: 'line',
        smooth: smooth,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { width: 2, color: color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color + 'cc' },
              { offset: 1, color: color + '10' }
            ]
          }
        },
        data: data.map(item => item[s.key])
      }
    })
  }

  return (
    <div className={cn('w-full', className)}>
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
