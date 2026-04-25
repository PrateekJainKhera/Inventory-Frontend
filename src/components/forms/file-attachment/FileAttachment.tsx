'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  File as FileIcon,
  FileText,
  Image,
  FileArchive,
  FileVideo,
  FileAudio,
  Download,
  Eye,
  Trash2,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Plus,
  XCircle,
  Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout'

export interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  file?: File
}

export interface FileAttachmentProps {
  value?: AttachedFile[]
  onChange?: (files: AttachedFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  acceptedFileTypes?: string[]
  label?: string
  className?: string
  disabled?: boolean
  showInlinePreview?: boolean // Show preview directly when single file selected
  previewShape?: 'circular' | 'rectangular' // Shape of inline preview
  previewSize?: 'sm' | 'md' | 'lg' // Size of inline preview
  hideInstructions?: boolean // Hide the "Drag & drop" instruction text
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return FileVideo
  if (type.startsWith('audio/')) return FileAudio
  if (type.includes('pdf') || type.includes('text/')) return FileText
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return FileArchive
  return FileIcon
}

const getFileTypeColor = (type: string) => {
  if (type.startsWith('image/')) return 'text-green-600 bg-green-50'
  if (type.startsWith('video/')) return 'text-purple-600 bg-purple-50'
  if (type.startsWith('audio/')) return 'text-blue-600 bg-blue-50'
  if (type.includes('pdf')) return 'text-red-600 bg-red-50'
  if (type.includes('text/')) return 'text-gray-600 bg-gray-50'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'text-orange-600 bg-orange-50'
  return 'text-gray-600 bg-gray-50'
}

export function FileAttachment({
  value = [],
  onChange,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = [],
  label = "File Attachment",
  className,
  disabled = false,
  showInlinePreview = false,
  previewShape = 'rectangular',
  previewSize = 'md',
  hideInstructions = false
}: FileAttachmentProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [previewFile, setPreviewFile] = React.useState<AttachedFile | null>(null)
  const [imageZoom, setImageZoom] = React.useState(1)
  const [imageRotation, setImageRotation] = React.useState(0)
  const [showCameraModal, setShowCameraModal] = React.useState(false)
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)
  const [showCropModal, setShowCropModal] = React.useState(false)
  const [imageToCrop, setImageToCrop] = React.useState<string | null>(null)
  const [cropArea, setCropArea] = React.useState({ x: 0, y: 0, width: 100, height: 100 })
  const [isDraggingImage, setIsDraggingImage] = React.useState(false)
  const [isResizingCrop, setIsResizingCrop] = React.useState<string | null>(null) // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = React.useState({ x: 0, y: 0 })
  const [initialCropArea, setInitialCropArea] = React.useState({ x: 0, y: 0, width: 100, height: 100 })
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const cropCanvasRef = React.useRef<HTMLCanvasElement>(null)
  const cropImageRef = React.useRef<HTMLImageElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return

    const currentFiles = value || []
    const file = files[0] // Only process first file for inline preview mode

    if (!file) return

    // Check file count limit
    if (currentFiles.length >= maxFiles) return

    // Check file size - 2MB limit for images
    const sizeLimit = file.type.startsWith('image/') ? 2 * 1024 * 1024 : maxFileSize
    if (file.size > sizeLimit) {
      alert(`File "${file.name}" is too large. Maximum size is ${formatFileSize(sizeLimit)}`)
      return
    }

    // Check file type
    if (acceptedFileTypes.length > 0 && !acceptedFileTypes.some(type => file.type.includes(type))) {
      alert(`File type "${file.type}" is not accepted`)
      return
    }

    // For images, show cropper first
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    } else {
      const attachedFile: AttachedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        url: URL.createObjectURL(file)
      }
      onChange?.([...currentFiles, attachedFile])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const removeFile = (fileId: string) => {
    if (disabled) return
    
    const updatedFiles = value.filter(file => file.id !== fileId)
    onChange?.(updatedFiles)
  }

  const openFileDialog = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const openImageDialog = () => {
    if (disabled) return
    imageInputRef.current?.click()
  }

  const openCamera = async () => {
    if (disabled) return

    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.')
        return
      }

      // Check camera permission status if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })

          if (permissionStatus.state === 'denied') {
            alert(
              'Camera access has been blocked.\n\n' +
              'To enable camera access:\n' +
              '1. Click the camera/lock icon in your browser\'s address bar\n' +
              '2. Change camera permission to "Allow"\n' +
              '3. Refresh the page and try again'
            )
            return
          }
        } catch (permError) {
          // Permission API might not support camera, continue anyway
        }
      }

      let stream: MediaStream | null = null

      try {
        // Try with default camera first (more compatible)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
      } catch (firstError: any) {

        // Fallback: Try with minimal constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          })
        } catch (secondError: any) {
          // If both attempts fail, throw the second error
          throw secondError
        }
      }

      if (stream) {
        setCameraStream(stream)
        setShowCameraModal(true)

        // Wait for modal to render then set video source
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch((playError) => {
              console.error('Error playing video:', playError)
            })
          }
        }, 100)
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)

      // Provide specific error messages based on error type
      let errorMessage = 'Unable to access camera. '

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Camera permission was denied.\n\n'
        errorMessage += 'To fix this:\n'
        errorMessage += '1. Click the camera/lock icon in your browser\'s address bar\n'
        errorMessage += '2. Allow camera access for this site\n'
        errorMessage += '3. Refresh the page and try again\n\n'
        errorMessage += 'Note: Camera access requires HTTPS (secure connection).'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application. Please close other apps using the camera and try again.'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not support the requested settings. Trying with default settings...'
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Camera access is blocked due to security restrictions.\n\n'
        errorMessage += 'This usually happens when:\n'
        errorMessage += '- The site is not served over HTTPS\n'
        errorMessage += '- Browser security settings block camera access\n'
        errorMessage += '- You\'re using an incognito/private window'
      } else {
        errorMessage += `Error: ${err.message || 'Unknown error'}\n\n`
        errorMessage += 'Please check your browser permissions and try again.'
      }

      alert(errorMessage)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    ctx?.drawImage(video, 0, 0)
    
    const imageDataUrl = canvas.toDataURL('image/jpeg')
    setCapturedImage(imageDataUrl)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const confirmPhoto = () => {
    if (!capturedImage) return
    
    // Convert data URL to blob
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const fileName = `camera-${Date.now()}.jpg`
        let file: File
        
        try {
          file = new (File as any)([blob], fileName, { type: 'image/jpeg' })
        } catch (error) {
          // Fallback for older browsers
          const fileBlob = blob as any
          fileBlob.name = fileName
          fileBlob.lastModified = Date.now()
          file = fileBlob
        }
        
        const fileList = {
          0: file,
          length: 1,
          item: (index: number) => index === 0 ? file : null,
          [Symbol.iterator]: function* () {
            yield file
          }
        } as FileList
        
        handleFileSelect(fileList)
        closeCameraModal()
      })
  }

  const closeCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setCapturedImage(null)
    setShowCameraModal(false)
  }

  const downloadFile = (file: AttachedFile) => {
    if (file.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.click()
    }
  }

  const handlePreviewFile = (file: AttachedFile) => {
    setPreviewFile(file)
    setImageZoom(1)
    setImageRotation(0)
  }

  const hasFile = value.length > 0
  const singleFile = value.length === 1 ? value[0] : null
  const isImage = singleFile?.type.startsWith('image/')

  // Preview size classes
  const previewSizeClasses = {
    sm: previewShape === 'circular' ? 'w-24 h-24' : 'w-32 h-20',
    md: previewShape === 'circular' ? 'w-32 h-32' : 'w-48 h-28',
    lg: previewShape === 'circular' ? 'w-40 h-40' : 'w-64 h-36',
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Inline Preview Mode */}
      {showInlinePreview && hasFile && singleFile && isImage ? (
        <div className="flex flex-col items-center justify-center">
          {/* Hidden file inputs - Only images for inline preview */}
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          <input
            ref={imageInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          {/* Image Preview - Centered */}
          <div className="relative group flex-shrink-0">
            <div
              className={cn(
                previewSizeClasses[previewSize],
                previewShape === 'circular' && 'rounded-full',
                previewShape === 'rectangular' && 'rounded-lg',
                'border-2 border-[rgb(var(--bd-default))] overflow-hidden bg-gray-50 cursor-pointer transition-all hover:shadow-lg relative'
              )}
            >
              {singleFile.url ? (
                <img
                  src={singleFile.url}
                  alt={singleFile.name}
                  className={cn(
                    'w-full h-full object-cover absolute inset-0',
                    previewShape === 'circular' && 'object-center'
                  )}
                  onError={(e) => {
                    console.error('Image failed to load:', singleFile.url)
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                  No preview
                </div>
              )}
            </div>

            {/* Hover overlay with action buttons */}
            <div
              className={cn(
                'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer',
                previewShape === 'circular' && 'rounded-full',
                previewShape === 'rectangular' && 'rounded-lg'
              )}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePreviewFile(singleFile)
                }}
                disabled={disabled}
                className="h-8 bg-white/90 hover:bg-white border-white"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openFileDialog()
                }}
                disabled={disabled}
                className="h-8 bg-white/90 hover:bg-white border-white"
              >
                <Upload className="h-3 w-3 mr-1" />
                Change
              </Button>
            </div>
          </div>

          {/* Label below preview */}
          {label && (
            <label className="block text-sm font-medium text-gray-700 mt-3 text-center">
              {label}
            </label>
          )}
        </div>
      ) : showInlinePreview ? (
        /* Empty state for inline preview - matches final shape */
        <div className="flex flex-col items-center justify-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          <input
            ref={imageInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          {/* Empty preview area with + button */}
          <div className="relative group">
            <div
              className={cn(
                previewSizeClasses[previewSize],
                previewShape === 'circular' && 'rounded-full',
                previewShape === 'rectangular' && 'rounded-lg',
                'border-2 border-dashed border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] cursor-pointer transition-all hover:border-gray-400 flex items-center justify-center'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Plus Icon - Always visible */}
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>

            {/* Action buttons overlay - shown on hover */}
            <div
              className={cn(
                'absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2',
                previewShape === 'circular' && 'rounded-full',
                previewShape === 'rectangular' && 'rounded-lg'
              )}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openFileDialog()
                }}
                disabled={disabled || value.length >= maxFiles}
                className="h-8 bg-white border-gray-300 hover:border-gray-400"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openCamera()
                }}
                disabled={disabled || value.length >= maxFiles}
                className="h-8 bg-white border-gray-300 hover:border-gray-400"
              >
                <Camera className="h-3 w-3 mr-1" />
                Camera
              </Button>
            </div>
          </div>

          {/* Label below empty preview */}
          {label && (
            <label className="block text-sm font-medium text-gray-700 mt-3 text-center">
              {label}
            </label>
          )}
        </div>
      ) : (
        /* Regular Upload Area - Non-inline preview mode */
        <div>
          {label && (
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {label}
            </label>
          )}
          <div
            className={cn(
              'group border-2 border-dashed rounded-lg transition-all duration-200 px-3 py-2 h-10',
              isDragging && !disabled && 'border-blue-400 bg-blue-50',
              !isDragging && !disabled && 'border-gray-300 hover:border-gray-400',
              disabled && 'border-gray-200 bg-gray-50 cursor-not-allowed',
              'cursor-pointer flex flex-col items-center justify-center relative'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.bmp,.webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={disabled}
            />

            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={disabled}
            />

            {/* Instruction Text - always visible */}
            {!hideInstructions && (
              <p className="text-xs text-[rgb(var(--fg-muted))]">
                Hover to upload or drag and drop (PDF, XLSX, PNG, JPG)
              </p>
            )}

            {/* Buttons - shown on hover, overlay on top */}
            <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
              {/* Upload Files Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openFileDialog()
                }}
                disabled={disabled || value.length >= maxFiles}
                className="h-8 text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload Files
              </Button>

              {/* Camera Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openCamera()
                }}
                disabled={disabled || value.length >= maxFiles}
                className="h-8 text-xs"
              >
                <Camera className="h-3 w-3 mr-1" />
                Camera
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* File List - Horizontal Layout (hidden when inline preview is shown) */}
      <AnimatePresence>
        {value.length > 0 && !(showInlinePreview && singleFile && isImage) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="flex flex-wrap gap-3">
              {value.map((file, index) => {
                const FileIcon = getFileIcon(file.type)
                const colorClasses = getFileTypeColor(file.type)

                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className={cn(
                      'flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer',
                      'w-20 h-20'
                    )}>
                      <div className={cn('p-1.5 rounded-lg mb-1', colorClasses)}>
                        <FileIcon className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-gray-500 truncate w-full text-center">
                        {formatFileSize(file.size)}
                      </div>

                      {/* Remove button - always visible on hover */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(file.id)
                        }}
                        disabled={disabled}
                      >
                        <X className="h-3 w-3" />
                      </Button>

                      {/* Action buttons on hover */}
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Preview button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-white/20 hover:bg-white/30 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewFile(file)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {/* Download button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-white/20 hover:bg-white/30 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadFile(file)
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Tooltip with filename on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {file.name}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Count Info - Only show for multiple files or non-inline preview */}
      {value.length > 1 && !showInlinePreview && (
        <div className="mt-2 text-xs text-gray-500">
          {value.length} of {maxFiles} files attached
        </div>
      )}

      {/* Preview Modal - Full Screen */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white w-full h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const FileIcon = getFileIcon(previewFile.type)
                    const colorClasses = getFileTypeColor(previewFile.type)
                    return (
                      <div className={cn('p-2 rounded-lg', colorClasses)}>
                        <FileIcon className="h-5 w-5" />
                      </div>
                    )
                  })()}
                  <div>
                    <h3 className="font-semibold text-gray-900">{previewFile.name}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(previewFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(previewFile)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 max-h-[70vh] overflow-auto">
                {previewFile.type.startsWith('image/') && previewFile.url ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full h-auto mx-auto rounded-lg"
                  />
                ) : previewFile.type === 'application/pdf' && previewFile.url ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[60vh] rounded-lg"
                    title={previewFile.name}
                  />
                ) : previewFile.type.startsWith('text/') && previewFile.url ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[60vh] rounded-lg bg-gray-50"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    {(() => {
                      const FileIcon = getFileIcon(previewFile.type)
                      return <FileIcon className="h-16 w-16 mb-4" />
                    })()}
                    <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                    <p className="text-sm text-center mb-4">
                      This file type cannot be previewed directly.
                      <br />
                      Click download to view the file.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => downloadFile(previewFile)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop Modal */}
      <AnimatePresence>
        {showCropModal && imageToCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => {
              setShowCropModal(false)
              setImageToCrop(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-[rgb(var(--bg-surface))] flex flex-col rounded-lg overflow-hidden shadow-2xl"
              style={{ width: '50vw', height: '70vh', minWidth: '600px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Crop Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[rgb(var(--bd-default))]">
                <h3 className="text-sm font-semibold text-[rgb(var(--fg-default))]">Crop Image</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCropModal(false)
                    setImageToCrop(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Crop Area */}
              <div
                className="flex-1 flex items-center justify-center bg-[rgb(var(--bg-default))] overflow-hidden relative p-0"
                style={{ minHeight: 0 }}
                onMouseMove={(e) => {
                  if (isDraggingImage && cropImageRef.current) {
                    const deltaX = e.clientX - dragStart.x
                    const deltaY = e.clientY - dragStart.y

                    // Move the image position, not the crop area
                    const newX = imagePosition.x + deltaX
                    const newY = imagePosition.y + deltaY

                    setImagePosition({ x: newX, y: newY })
                    setDragStart({ x: e.clientX, y: e.clientY })
                  } else if (isResizingCrop && cropImageRef.current) {
                    const deltaX = e.clientX - dragStart.x
                    const deltaY = e.clientY - dragStart.y
                    const img = cropImageRef.current
                    const imgWidth = img.clientWidth
                    const imgHeight = img.clientHeight

                    let newCrop = { ...initialCropArea }

                    // Handle corner resizing
                    if (isResizingCrop.includes('n')) {
                      newCrop.y = Math.max(0, Math.min(initialCropArea.y + deltaY, initialCropArea.y + initialCropArea.height - 50))
                      newCrop.height = initialCropArea.height - (newCrop.y - initialCropArea.y)
                    }
                    if (isResizingCrop.includes('s')) {
                      newCrop.height = Math.max(50, Math.min(imgHeight - initialCropArea.y, initialCropArea.height + deltaY))
                    }
                    if (isResizingCrop.includes('w')) {
                      newCrop.x = Math.max(0, Math.min(initialCropArea.x + deltaX, initialCropArea.x + initialCropArea.width - 50))
                      newCrop.width = initialCropArea.width - (newCrop.x - initialCropArea.x)
                    }
                    if (isResizingCrop.includes('e')) {
                      newCrop.width = Math.max(50, Math.min(imgWidth - initialCropArea.x, initialCropArea.width + deltaX))
                    }

                    // For circular preview, maintain aspect ratio (square)
                    if (previewShape === 'circular') {
                      const size = Math.min(newCrop.width, newCrop.height)
                      newCrop.width = size
                      newCrop.height = size
                    }

                    setCropArea(newCrop)
                  }
                }}
                onMouseUp={() => {
                  if (isDraggingImage) {
                    setIsDraggingImage(false)
                  }
                  if (isResizingCrop) {
                    setIsResizingCrop(null)
                  }
                }}
                onMouseLeave={() => {
                  if (isDraggingImage) {
                    setIsDraggingImage(false)
                  }
                  if (isResizingCrop) {
                    setIsResizingCrop(null)
                  }
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    ref={cropImageRef}
                    src={imageToCrop}
                    alt="Crop preview"
                    className="select-none"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      cursor: isResizingCrop ? 'default' : (isDraggingImage ? 'grabbing' : 'grab'),
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`
                    }}
                    draggable={false}
                    onMouseDown={(e) => {
                      if (!isResizingCrop) {
                        e.preventDefault()
                        setIsDraggingImage(true)
                        setDragStart({ x: e.clientX, y: e.clientY })
                      }
                    }}
                    onLoad={() => {
                      if (cropImageRef.current) {
                        const img = cropImageRef.current
                        const imgWidth = img.clientWidth
                        const imgHeight = img.clientHeight

                        // Initialize crop area to cover most of the image
                        let cropWidth, cropHeight

                        if (previewShape === 'circular') {
                          // For circular, make it square and 80% of the smaller dimension
                          const size = Math.min(imgWidth, imgHeight) * 0.85
                          cropWidth = size
                          cropHeight = size
                        } else {
                          // For rectangular, use 85% of width and 85% of height
                          cropWidth = imgWidth * 0.85
                          cropHeight = imgHeight * 0.85
                        }

                        const initialX = (imgWidth - cropWidth) / 2
                        const initialY = (imgHeight - cropHeight) / 2

                        setCropArea({
                          x: initialX,
                          y: initialY,
                          width: cropWidth,
                          height: cropHeight
                        })
                        // Image starts at 0,0 (no offset)
                        setImagePosition({ x: 0, y: 0 })
                      }
                    }}
                  />

                  {/* Crop Overlay - Visual indicator */}
                  {cropArea.width > 0 && (
                    <>
                      {/* Dark overlay for areas outside crop */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Top dark area */}
                        <div
                          className="absolute top-0 left-0 right-0 bg-black/50"
                          style={{ height: `${cropArea.y}px` }}
                        />
                        {/* Bottom dark area */}
                        <div
                          className="absolute left-0 right-0 bottom-0 bg-black/50"
                          style={{ top: `${cropArea.y + cropArea.height}px` }}
                        />
                        {/* Left dark area */}
                        <div
                          className="absolute left-0 bg-black/50"
                          style={{
                            top: `${cropArea.y}px`,
                            height: `${cropArea.height}px`,
                            width: `${cropArea.x}px`
                          }}
                        />
                        {/* Right dark area */}
                        <div
                          className="absolute right-0 bg-black/50"
                          style={{
                            top: `${cropArea.y}px`,
                            height: `${cropArea.height}px`,
                            left: `${cropArea.x + cropArea.width}px`
                          }}
                        />

                        {/* Crop area border with grid lines */}
                        <div
                          className={cn(
                            'absolute border-4 pointer-events-none',
                            previewShape === 'circular' && 'rounded-full',
                            previewShape === 'rectangular' && 'rounded-lg'
                          )}
                          style={{
                            left: `${cropArea.x}px`,
                            top: `${cropArea.y}px`,
                            width: `${cropArea.width}px`,
                            height: `${cropArea.height}px`,
                            borderColor: 'rgb(var(--color-primary))',
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {/* 3x3 Grid lines (Rule of thirds) */}
                          <>
                            {/* Vertical lines */}
                            <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-[rgb(var(--color-primary))] opacity-60 pointer-events-none" />
                            <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-[rgb(var(--color-primary))] opacity-60 pointer-events-none" />
                            {/* Horizontal lines */}
                            <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-[rgb(var(--color-primary))] opacity-60 pointer-events-none" />
                            <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-[rgb(var(--color-primary))] opacity-60 pointer-events-none" />
                          </>

                          {/* Corner handles - larger and more visible */}
                          <div className="absolute -top-1 -left-1 w-5 h-5 border-l-4 border-t-4 border-[rgb(var(--color-primary))] pointer-events-none" />
                          <div className="absolute -top-1 -right-1 w-5 h-5 border-r-4 border-t-4 border-[rgb(var(--color-primary))] pointer-events-none" />
                          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-l-4 border-b-4 border-[rgb(var(--color-primary))] pointer-events-none" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-r-4 border-b-4 border-[rgb(var(--color-primary))] pointer-events-none" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Hidden canvas for cropping */}
                <canvas
                  ref={cropCanvasRef}
                  className="hidden"
                />
              </div>

              {/* Crop Footer */}
              <Footer
                variant="modal"
                gradient={true}
                actions={
                  <>
                    <Button
                      variant="action-cancel"
                      onClick={() => {
                        setShowCropModal(false)
                        setImageToCrop(null)
                      }}
                      icon={XCircle}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="action-save"
                      onClick={() => {
                        // Crop and save the image
                        if (cropImageRef.current && cropCanvasRef.current) {
                          const img = cropImageRef.current
                          const canvas = cropCanvasRef.current
                          const ctx = canvas.getContext('2d')

                          if (ctx) {
                            // Set canvas size to crop area
                            canvas.width = cropArea.width
                            canvas.height = cropArea.height

                            // Adjust crop coordinates to account for image translation
                            const actualCropX = cropArea.x - imagePosition.x
                            const actualCropY = cropArea.y - imagePosition.y

                            // Draw cropped image
                            ctx.drawImage(
                              img,
                              actualCropX, actualCropY, cropArea.width, cropArea.height,
                              0, 0, cropArea.width, cropArea.height
                            )

                            // Convert to blob and check size
                            canvas.toBlob((blob) => {
                              if (blob) {
                                if (blob.size > 500 * 1024) {
                                  alert('Cropped image is still too large. Please crop a smaller area.')
                                  return
                                }

                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  const attachedFile: AttachedFile = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: 'cropped-image.jpg',
                                    size: blob.size,
                                    type: 'image/jpeg',
                                    file: new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }),
                                    url: reader.result as string
                                  }
                                  onChange?.([attachedFile])
                                  setShowCropModal(false)
                                  setImageToCrop(null)
                                }
                                reader.readAsDataURL(blob)
                              }
                            }, 'image/jpeg', 0.9)
                          }
                        }
                      }}
                      icon={Save}
                    >
                      Crop & Upload
                    </Button>
                  </>
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
            onClick={closeCameraModal}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white w-full h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Camera Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {capturedImage ? 'Review Photo' : 'Take Photo'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeCameraModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Camera Content */}
              <div className="flex-1 flex items-center justify-center p-4 bg-black">
                {!capturedImage ? (
                  /* Live Camera View */
                  <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    
                    {/* Capture Button */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <Button
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full bg-white text-gray-900 hover:bg-gray-100 border-4 border-white"
                      >
                        <Camera className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Captured Image Preview */
                  <div className="relative w-full max-w-2xl">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-auto rounded-lg"
                    />
                    
                    {/* Image Controls */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={retakePhoto}
                        className="bg-white/90 hover:bg-white"
                      >
                        Retake
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Footer */}
              <div className="flex items-center justify-center p-4 border-t bg-white">
                {capturedImage ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={retakePhoto}
                    >
                      Retake Photo
                    </Button>
                    <Button
                      variant="primary"
                      onClick={confirmPhoto}
                    >
                      Use Photo
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center">
                    <p>Position your camera and tap the capture button</p>
                    <p className="text-xs mt-1">Make sure the image is clear and well-lit</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}