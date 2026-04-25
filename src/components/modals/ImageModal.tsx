'use client'

import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Download, Printer, Copy, Maximize2, FileImage, File, X } from 'lucide-react'

export interface ImageModalDetail {
  label: string
  value: string | number
}

interface ImageModalProps {
  // Required
  title: string
  children: React.ReactNode

  // Preview mode (optional) - if provided, shows preview that opens to modal
  preview?: React.ReactNode
  previewClassName?: string
  previewContainerClassName?: string

  // Modal control (optional) - for external control
  isOpen?: boolean
  onClose?: () => void

  // Optional metadata for modal header
  details?: ImageModalDetail[]

  // Callbacks
  onPreviewClick?: () => void
}

export function ImageModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  title,
  children,
  preview,
  previewClassName = '',
  previewContainerClassName = '',
  details,
  onPreviewClick
}: ImageModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = controlledOnClose ? (open: boolean) => !open && controlledOnClose() : setInternalIsOpen

  const handlePreviewClick = () => {
    if (onPreviewClick) {
      onPreviewClick()
    } else {
      setIsOpen(true)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const exportAsPNG = async () => {
    if (!contentRef.current) return

    try {
      // Find SVG element within the content
      const svgElement = contentRef.current.querySelector('svg')
      if (!svgElement) {
        console.error('SVG element not found')
        return
      }

      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement

      // Get the SVG dimensions from viewBox or getBoundingClientRect
      const viewBox = svgElement.getAttribute('viewBox')
      let width = 800
      let height = 600

      if (viewBox) {
        const parts = viewBox.split(' ')
        width = parseFloat(parts[2]) || 800
        height = parseFloat(parts[3]) || 600
      } else {
        const svgRect = svgElement.getBoundingClientRect()
        width = svgRect.width || 800
        height = svgRect.height || 600
      }

      // Set explicit dimensions on cloned SVG
      clonedSvg.setAttribute('width', String(width * 2))
      clonedSvg.setAttribute('height', String(height * 2))

      // Create canvas with 2x resolution for better quality
      const canvas = document.createElement('canvas')
      canvas.width = width * 2
      canvas.height = height * 2
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Convert SVG to base64 data URL (more reliable than blob URL)
      const svgData = new XMLSerializer().serializeToString(clonedSvg)
      const base64Data = btoa(unescape(encodeURIComponent(svgData)))
      const dataUrl = `data:image/svg+xml;base64,${base64Data}`

      // Draw to canvas
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.download = `${title.replace(/\s+/g, '_')}.png`
            link.href = downloadUrl
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(downloadUrl)
          }
        }, 'image/png')
      }

      img.onerror = (err) => {
        console.error('Error loading SVG image:', err)
      }

      img.src = dataUrl
    } catch (error) {
      console.error('Error exporting PNG:', error)
    }
  }

  const exportAsSVG = () => {
    if (!contentRef.current) return

    try {
      const svgElement = contentRef.current.querySelector('svg')
      if (!svgElement) return

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.download = `${title.replace(/\s+/g, '_')}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting SVG:', error)
    }
  }

  const exportAsPDF = async () => {
    if (!contentRef.current) return

    try {
      const svgElement = contentRef.current.querySelector('svg')
      if (!svgElement) return

      // For PDF export, we'll use the browser's print functionality with PDF destination
      const printWindow = window.open('', '', 'width=800,height=600')
      if (!printWindow) return

      const svgData = new XMLSerializer().serializeToString(svgElement)

      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { margin: 0; padding: 20px; }
              svg { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <h2>${title}</h2>
            ${svgData}
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 100);
              };
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  const handlePrint = () => {
    if (!contentRef.current) return

    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const svgElement = contentRef.current.querySelector('svg')
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { margin: 0; padding: 20px; }
            svg { max-width: 100%; height: auto; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          ${svgData}
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const copyToClipboard = async () => {
    if (!contentRef.current) return

    try {
      const svgElement = contentRef.current.querySelector('svg')
      if (!svgElement) return

      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement

      // Get dimensions from viewBox
      const viewBox = svgElement.getAttribute('viewBox')
      let width = 800
      let height = 600

      if (viewBox) {
        const parts = viewBox.split(' ')
        width = parseFloat(parts[2]) || 800
        height = parseFloat(parts[3]) || 600
      } else {
        const svgRect = svgElement.getBoundingClientRect()
        width = svgRect.width || 800
        height = svgRect.height || 600
      }

      // Set explicit dimensions
      clonedSvg.setAttribute('width', String(width * 2))
      clonedSvg.setAttribute('height', String(height * 2))

      // Create canvas for copying
      const canvas = document.createElement('canvas')
      canvas.width = width * 2
      canvas.height = height * 2
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Convert SVG to base64 data URL
      const svgData = new XMLSerializer().serializeToString(clonedSvg)
      const base64Data = btoa(unescape(encodeURIComponent(svgData)))
      const dataUrl = `data:image/svg+xml;base64,${base64Data}`

      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = async () => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ])
              alert('Copied to clipboard!')
            } catch (err) {
              console.error('Failed to copy:', err)
            }
          }
        }, 'image/png')
      }

      img.onerror = (err) => {
        console.error('Error loading SVG for clipboard:', err)
      }

      img.src = dataUrl
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const toggleFullScreen = () => {
    if (!contentRef.current) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      contentRef.current.requestFullscreen()
    }
  }

  return (
    <>
      {/* Preview Container (if preview prop provided) */}
      {preview && (
        <div
          className={`border border-[rgb(var(--bd-default))] rounded bg-[rgb(var(--bg-surface))] h-full flex items-center justify-center transition-all cursor-pointer hover:shadow-lg ${previewContainerClassName}`}
          onClick={handlePreviewClick}
        >
          <div className={previewClassName}>{preview}</div>
        </div>
      )}

      {/* Full-Size Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-auto max-w-[95vw] max-h-[95vh] flex flex-col p-0 bg-[rgb(var(--bg-surface))] z-[100] overflow-hidden" hideCloseButton>
          <DialogHeader className="px-6 py-3 border-b border-[rgb(var(--bd-default))] flex-shrink-0 bg-[rgb(var(--bg-surface))]">
            <div className="flex items-center justify-between">
              <DialogTitle>{title}</DialogTitle>
              <button
                onClick={handleClose}
                className="rounded-sm opacity-70 ring-offset-[rgb(var(--bg-surface))] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-2"
              >
                <X className="h-4 w-4 text-[rgb(var(--color-icon))]" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </DialogHeader>

          {/* Details Section */}
          {details && details.length > 0 && (
            <div className="px-6 py-2.5 bg-[rgb(var(--bg-subtle))] border border-[rgb(var(--bd-default))] rounded-lg mx-6 my-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--fg-default))]">
                {details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="font-medium text-[rgb(var(--fg-muted))]">{detail.label}:</span>
                    <span className="font-normal">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagram Content */}
          <div
            ref={contentRef}
            className="flex-1 px-6 pb-6 bg-[rgb(var(--bg-surface))] rounded-lg flex items-center justify-center"
            style={{ minHeight: 0 }}
          >
            <div className="w-full h-full flex items-center justify-center bg-[rgb(var(--bg-surface))]">
              {children}
            </div>
          </div>

          {/* Export Toolbar */}
          <div className="flex items-center justify-between border-t px-6 py-4 gap-2 bg-[rgb(var(--bg-surface))] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAsPNG}
                className="flex items-center gap-2"
              >
                <FileImage className="h-4 w-4" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAsSVG}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAsPDF}
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                PDF
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullScreen}
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Full Screen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
