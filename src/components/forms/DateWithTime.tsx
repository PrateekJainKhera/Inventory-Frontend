'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'
import { DatePicker } from './date-picker'

export interface DateWithTimeProps {
  label?: string
  value?: Date | string
  onChange?: (dateTime: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  required?: boolean
  minDate?: Date
  maxDate?: Date
}

/**
 * DateWithTime Component
 * A custom date-time picker with separate date and time selection
 */
export function DateWithTime({
  label,
  value,
  onChange,
  placeholder = 'Select date and time',
  disabled = false,
  error = false,
  minDate,
  maxDate,
}: DateWithTimeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('00:00')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const date = typeof value === 'string' ? new Date(value) : value
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        setSelectedTime(`${hours}:${minutes}`)
      }
    } else {
      setSelectedDate(undefined)
      setSelectedTime('00:00')
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDateSelect = (date: Date | string | undefined) => {
    if (date) {
      const parsedDate = typeof date === 'string' ? new Date(date) : date
      setSelectedDate(parsedDate)
      updateDateTime(parsedDate, selectedTime)
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      updateDateTime(selectedDate, time)
    }
  }

  const updateDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':')
    const newDate = new Date(date)
    newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

    if (onChange) {
      onChange(newDate.toISOString())
    }
  }

  const displayValue = selectedDate
    ? `${selectedDate.toLocaleDateString('en-GB')} ${selectedTime}`
    : ''

  return (
    <div className="flex flex-col w-full relative">
      {label && (
        <Label className="text-xs font-medium text-[rgb(var(--fg-default))] mb-1.5">
          {label}
        </Label>
      )}

      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full justify-start text-left font-normal h-9
          ${!selectedDate && 'text-[rgb(var(--fg-muted))]'}
          ${error && 'border-[rgb(var(--color-danger))]'}
        `}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {displayValue || placeholder}
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 z-50 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--bd-default))] rounded-lg shadow-lg"
        >
          <div className="p-3">
            {/* Date Picker */}
            <DatePicker
              value={selectedDate}
              onChange={handleDateSelect}
              mode="single"
              minDate={minDate}
              maxDate={maxDate}
              showTime={false}
              returnFormat="date"
            />

            {/* Time Picker */}
            <div className="border-t border-[rgb(var(--bd-default))] pt-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
                <Label className="text-xs font-medium">Select Time</Label>
              </div>

              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-3 mt-3 border-t border-[rgb(var(--bd-default))]">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs text-[rgb(var(--color-danger))]">
          This field is required
        </span>
      )}
    </div>
  )
}

export default DateWithTime
