'use client'

import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

export interface DonutChartDataItem {
  name: string
  value: number
  color?: string
}

export interface DonutChartProps {
  data: DonutChartDataItem[]
  height?: number
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string
  innerRadius?: string
  outerRadius?: string
  className?: string
}

/**
 * DonutChart - ECharts Donut/Pie Chart component
 */
export function DonutChart({
  data,
  height = 300,
  showLegend = true,
  centerLabel,
  centerValue,
  innerRadius = '50%',
  outerRadius = '70%',
  className
}: DonutChartProps) {
  const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e9ecef',
      borderWidth: 1,
      textStyle: {
        color: '#344767',
        fontSize: 12
      },
      formatter: '{b}: {c} ({d}%)'
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
    graphic: (centerLabel || centerValue) ? [
      {
        type: 'group',
        left: 'center',
        top: 'center',
        children: [
          centerValue ? {
            type: 'text',
            style: {
              text: centerValue,
              fontSize: 24,
              fontWeight: 600,
              fill: '#344767',
              textAlign: 'center'
            },
            top: centerLabel ? -10 : 0
          } : null,
          centerLabel ? {
            type: 'text',
            style: {
              text: centerLabel,
              fontSize: 12,
              fill: '#6c757d',
              textAlign: 'center'
            },
            top: centerValue ? 15 : 0
          } : null
        ].filter(Boolean)
      }
    ] : undefined,
    series: [
      {
        type: 'pie',
        radius: [innerRadius, outerRadius],
        center: ['50%', showLegend ? '45%' : '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color || colors[index % colors.length]
          }
        }))
      }
    ]
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
