'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { currencyAPI, type CurrencyInfo, type ExchangeRates } from '@/lib/api'

// Dynamic currency type based on API response
export type CurrencyCode = string

// CurrencyInfo and ExchangeRates imported from currency-api

interface CurrencyContextType {
  // Current settings
  selectedCurrency: CurrencyCode
  baseCurrency: CurrencyCode
  exchangeRates: ExchangeRates
  availableCurrencies: CurrencyInfo[]
  isLoading: boolean
  isLoadingCurrencies: boolean
  lastUpdated: Date | null
  error: string | null

  // Actions
  setCurrency: (currency: CurrencyCode) => void
  refreshRates: () => Promise<void>
  refreshCurrencies: () => Promise<void>
  convertAmount: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number
  formatCurrency: (
    amount: number,
    currency?: CurrencyCode,
    options?: {
      showSymbol?: boolean
      locale?: string
      compact?: boolean
      precision?: number
    }
  ) => string
  parseCurrencyInput: (input: string, currency?: CurrencyCode) => number | null
  getCurrencyInfo: (currency: CurrencyCode) => CurrencyInfo | null
  getAllCurrencies: () => CurrencyInfo[]

  // Manual rates for hedged scenarios
  setManualRate: (from: CurrencyCode, to: CurrencyCode, rate: number) => void
  removeManualRate: (from: CurrencyCode, to: CurrencyCode) => void
  isManualRate: (from: CurrencyCode, to: CurrencyCode) => boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Reliable exchange rate service with multiple APIs
class ExchangeRateService {
  private static instance: ExchangeRateService
  private cache: { rates: ExchangeRates; timestamp: number } | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService()
    }
    return ExchangeRateService.instance
  }


  private async fetchFromAPI(): Promise<ExchangeRates | null> {
    try {
      const response = await fetch('https://api.frankfurter.app/latest?base=INR', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      const rates = data.rates

      if (rates && typeof rates === 'object') {
        // Ensure INR is included and normalize currency codes to uppercase
        const normalizedRates: ExchangeRates = { INR: 1 }
        for (const [key, value] of Object.entries(rates)) {
          normalizedRates[key.toUpperCase()] = value as number
        }
        return normalizedRates
      }
    } catch (error) {
      // Silent fail - currency conversion is optional
    }

    return null
  }

  async getRates(): Promise<ExchangeRates> {
    // Check cache
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.rates
    }

    try {
      // Try to fetch from API
      const apiRates = await this.fetchFromAPI()

      if (apiRates) {
        this.cache = {
          rates: apiRates,
          timestamp: Date.now()
        }
        return apiRates
      }
    } catch (error) {
      // Exchange rate API unavailable - fallback to INR only
    }

    // No fallback - return only INR base rate
    // Unable to fetch exchange rates from API. Falling back to INR only.
    const baseRates: ExchangeRates = { INR: 1 }
    this.cache = {
      rates: baseRates,
      timestamp: Date.now()
    }
    return baseRates
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR')
  const [baseCurrency] = useState<CurrencyCode>('INR')
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({})
  const [availableCurrencies, setAvailableCurrencies] = useState<CurrencyInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualRates, setManualRates] = useState<Map<string, number>>(new Map())

  const exchangeService = ExchangeRateService.getInstance()

  const refreshCurrencies = useCallback(async () => {
    setIsLoadingCurrencies(true)
    setError(null)

    try {
      const currencies = await currencyAPI.fetchCurrencies()
      setAvailableCurrencies(currencies)
    } catch (err) {
      setError('Failed to fetch available currencies')
      // Currency API error - silent fail
    } finally {
      setIsLoadingCurrencies(false)
    }
  }, [])

  const refreshRates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const rates = await exchangeService.getRates()
      setExchangeRates(rates)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to fetch exchange rates')
      // Exchange rate error - silent fail
    } finally {
      setIsLoading(false)
    }
  }, [exchangeService])

  // Load currencies and auto-refresh rates
  useEffect(() => {
    refreshCurrencies()
    refreshRates()
    const interval = setInterval(refreshRates, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [refreshCurrencies, refreshRates])

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setSelectedCurrency(currency)
    // Store in localStorage for persistence
    localStorage.setItem('selectedCurrency', currency)
  }, [])

  // Load saved currency on mount (after currencies are loaded)
  useEffect(() => {
    if (availableCurrencies.length > 0) {
      const saved = localStorage.getItem('selectedCurrency') as CurrencyCode
      const currencyExists = availableCurrencies.some(c => c.code === saved)
      if (saved && currencyExists) {
        setSelectedCurrency(saved)
      }
    }
  }, [availableCurrencies])

  const convertAmount = useCallback((
    amount: number,
    from: CurrencyCode = baseCurrency,
    to: CurrencyCode = selectedCurrency
  ): number => {
    if (from === to) return amount
    if (!amount || amount === 0) return 0

    const manualRateKey = `${from}-${to}`
    const manualRate = manualRates.get(manualRateKey)

    if (manualRate) {
      return amount * manualRate
    }

    // Use exchange rates
    if (from === baseCurrency) {
      const rate = exchangeRates[to]
      return rate ? amount * rate : amount
    }

    if (to === baseCurrency) {
      const rate = exchangeRates[from]
      return rate ? amount / rate : amount
    }

    // Cross currency conversion via base currency
    const fromRate = exchangeRates[from]
    const toRate = exchangeRates[to]

    if (fromRate && toRate) {
      const inBaseCurrency = amount / fromRate
      return inBaseCurrency * toRate
    }

    return amount
  }, [baseCurrency, selectedCurrency, exchangeRates, manualRates])

  const formatCurrency = useCallback((
    amount: number,
    currency: CurrencyCode = selectedCurrency,
    options?: {
      showSymbol?: boolean
      locale?: string
      compact?: boolean
      precision?: number
    }
  ): string => {
    const currencyInfo = availableCurrencies.find(c => c.code === currency)
    if (!currencyInfo) return amount.toString()

    const {
      showSymbol = true,
      locale = 'en-IN',
      compact = false,
      precision = currencyInfo.decimal
    } = options || {}

    // Handle zero and negative amounts
    if (amount === 0) {
      return showSymbol ? `${currencyInfo.symbol}0${precision > 0 ? '.' + '0'.repeat(precision) : ''}` : '0'
    }

    try {
      if (compact && Math.abs(amount) >= 1000) {
        // Compact formatting for large numbers
        const formatValue = (num: number, suffix: string) => {
          const formatted = new Intl.NumberFormat(locale, {
            style: showSymbol ? 'currency' : 'decimal',
            currency: showSymbol ? currency : undefined,
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }).format(num)
          return showSymbol ? formatted + suffix : formatted + suffix
        }

        if (Math.abs(amount) >= 10000000) { // 1 crore
          return formatValue(amount / 10000000, 'Cr')
        } else if (Math.abs(amount) >= 100000) { // 1 lakh
          return formatValue(amount / 100000, 'L')
        } else if (Math.abs(amount) >= 1000) { // 1 thousand
          return formatValue(amount / 1000, 'K')
        }
      }

      // Standard formatting
      return new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: showSymbol ? currency : undefined,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(amount)
    } catch {
      // Fallback formatting
      const formattedAmount = amount.toLocaleString(locale, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      })
      return showSymbol ? `${currencyInfo.symbol}${formattedAmount}` : formattedAmount
    }
  }, [selectedCurrency, availableCurrencies])

  const parseCurrencyInput = useCallback((
    input: string,
    currency: CurrencyCode = selectedCurrency
  ): number | null => {
    if (!input || input.trim() === '') return null

    const currencyInfo = availableCurrencies.find(c => c.code === currency)
    if (!currencyInfo) return null

    // Remove currency symbols and common formatting
    let cleaned = input
      .replace(new RegExp(currencyInfo.symbol, 'g'), '')
      .replace(/[,\s]/g, '') // Remove commas and spaces
      .replace(/[₹$€£¥]/g, '') // Remove common currency symbols
      .trim()

    // Handle Indian notation (L for lakh, Cr for crore, K for thousand)
    if (cleaned.toLowerCase().includes('cr')) {
      const number = parseFloat(cleaned.replace(/cr/i, ''))
      if (!isNaN(number)) return number * 10000000 // 1 crore = 10 million
    }

    if (cleaned.toLowerCase().includes('l')) {
      const number = parseFloat(cleaned.replace(/l/i, ''))
      if (!isNaN(number)) return number * 100000 // 1 lakh = 100,000
    }

    if (cleaned.toLowerCase().includes('k')) {
      const number = parseFloat(cleaned.replace(/k/i, ''))
      if (!isNaN(number)) return number * 1000 // 1K = 1,000
    }

    // Parse as regular number
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }, [selectedCurrency, availableCurrencies])

  const getCurrencyInfo = useCallback((currency: CurrencyCode): CurrencyInfo | null => {
    return availableCurrencies.find(c => c.code === currency) || null
  }, [availableCurrencies])

  const getAllCurrencies = useCallback((): CurrencyInfo[] => {
    return availableCurrencies
  }, [availableCurrencies])

  const setManualRate = useCallback((from: CurrencyCode, to: CurrencyCode, rate: number) => {
    const key = `${from}-${to}`
    setManualRates(prev => new Map(prev.set(key, rate)))
  }, [])

  const removeManualRate = useCallback((from: CurrencyCode, to: CurrencyCode) => {
    const key = `${from}-${to}`
    setManualRates(prev => {
      const newMap = new Map(prev)
      newMap.delete(key)
      return newMap
    })
  }, [])

  const isManualRate = useCallback((from: CurrencyCode, to: CurrencyCode): boolean => {
    const key = `${from}-${to}`
    return manualRates.has(key)
  }, [manualRates])

  const value: CurrencyContextType = {
    selectedCurrency,
    baseCurrency,
    exchangeRates,
    availableCurrencies,
    isLoading,
    isLoadingCurrencies,
    lastUpdated,
    error,
    setCurrency,
    refreshRates,
    refreshCurrencies,
    convertAmount,
    formatCurrency,
    parseCurrencyInput,
    getCurrencyInfo,
    getAllCurrencies,
    setManualRate,
    removeManualRate,
    isManualRate
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}