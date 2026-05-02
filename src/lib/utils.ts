import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatNumber(num: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercentage(value: number, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Converts a Date object to YYYY-MM-DD string using local timezone
 * Avoids UTC conversion issues that occur with toISOString()
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DD format (local timezone)
 */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Validates if a date falls within a given financial year
 * @param date - Date to validate (Date object or string)
 * @param fYear - Financial year in format "YYYY-YYYY" (e.g., "2024-2025")
 * @returns true if date is within the financial year or if validation is skipped
 */
export function isValidFinancialYearDate(date: Date | string, fYear: string): boolean {
  if (!date || !fYear) return true // Skip validation if no date or fYear

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const [startYear, endYear] = fYear.split('-').map(Number)

  if (!startYear || !endYear) return true // Invalid fYear format, skip validation

  // Financial year typically runs from April 1st of start year to March 31st of end year
  const fyStart = new Date(startYear, 3, 1) // April 1st (month is 0-indexed)
  const fyEnd = new Date(endYear, 2, 31) // March 31st

  return dateObj >= fyStart && dateObj <= fyEnd
}