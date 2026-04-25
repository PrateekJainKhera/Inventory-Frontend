'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeResult } from 'html5-qrcode'
import './qr-scanner.css'

export interface QRScanResult {
  rawValue: string
  decodedText: string
  format?: string
}

export interface QRScannerProps {
  onScan: (result: QRScanResult[]) => void
  onError?: (error: unknown) => void
  constraints?: {
    facingMode?: 'user' | 'environment'
  }
  styles?: {
    container?: React.CSSProperties
    video?: React.CSSProperties
  }
  fps?: number
  qrboxSize?: number
  aspectRatio?: number
  disableFlip?: boolean
  verbose?: boolean
}

export function QRScanner({
  onScan,
  onError,
  constraints,
  styles,
  fps = 10,
  qrboxSize = 250,
  aspectRatio = 1.0,
  disableFlip = false,
  verbose = false
}: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const mountedRef = useRef(true)
  const lastScanTimeRef = useRef<number>(0)
  const scanCooldown = 1000

  const handleScanSuccess = useCallback(
    (decodedText: string, result: Html5QrcodeResult) => {
      const now = Date.now()

      if (now - lastScanTimeRef.current < scanCooldown) {
        return
      }

      lastScanTimeRef.current = now

      if (mountedRef.current) {
        const scanResult: QRScanResult = {
          rawValue: decodedText,
          decodedText: decodedText,
          format: result.result.format?.formatName
        }
        onScan([scanResult])
      }
    },
    [onScan, scanCooldown]
  )

  const handleScanError = useCallback(
    () => {
      // Silent - fires continuously when no QR code detected
    },
    []
  )

  useEffect(() => {
    if (!elementRef.current) return

    mountedRef.current = true
    const scannerId = `qr-scanner-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

    if (elementRef.current) {
      elementRef.current.id = scannerId
    }

    let scanner: Html5Qrcode | null = null

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode(scannerId, verbose)
        scannerRef.current = scanner

        const config = {
          fps: fps,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: aspectRatio,
          disableFlip: disableFlip
        }

        const cameraConfig = {
          facingMode: constraints?.facingMode || 'environment'
        }

        await scanner.start(
          cameraConfig,
          config,
          handleScanSuccess,
          handleScanError
        )

        if (mountedRef.current) {
          setIsScanning(true)
        }
      } catch (error) {
        // Categorize error for appropriate logging
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isPermissionError = errorMessage.includes('NotAllowedError') ||
          errorMessage.includes('Permission denied')
        const isNotFoundError = errorMessage.includes('NotFoundError') ||
          errorMessage.includes('not found')

        // Log permission errors as warnings (expected user action)
        // Log other errors as errors (unexpected issues)
        if (isPermissionError) {
          console.warn('📷 Camera permission required. Please allow camera access to scan QR codes.')
        } else if (isNotFoundError) {
          console.warn('📷 No camera detected on this device.')
        } else {
          console.error('QR Scanner Error:', error)
        }

        if (mountedRef.current && onError) {
          onError(error)
        }
        setIsScanning(false)
      }
    }

    startScanner()

    return () => {
      mountedRef.current = false

      const cleanup = async () => {
        if (scanner) {
          try {
            const state = scanner.getState()

            if (state === Html5QrcodeScannerState.SCANNING ||
              state === Html5QrcodeScannerState.PAUSED) {
              await scanner.stop()
            }

            scanner.clear()
          } catch (err) {
            // Only log cleanup errors in verbose mode
            if (verbose) {
              console.warn('QR Scanner cleanup:', err)
            }
          } finally {
            scannerRef.current = null
            setIsScanning(false)
          }
        }
      }

      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    constraints?.facingMode,
    fps,
    qrboxSize,
    aspectRatio,
    disableFlip,
    verbose
  ])

  return (
    <div
      ref={elementRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        ...styles?.container
      }}
    />
  )
}
