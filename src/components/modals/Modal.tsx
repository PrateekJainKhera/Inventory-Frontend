'use client'

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Size presets for common modal sizes
const modalSizes = {
  sm: 'max-w-md w-full mx-4 h-auto',
  md: 'max-w-lg w-full mx-4 h-auto',
  lg: 'max-w-2xl w-full mx-4 h-auto',
  xl: 'max-w-4xl w-full mx-4 h-auto',
  master: 'w-[95vw] h-[96vh] max-w-none', // Standard for master pages
  fullscreen: 'w-[98vw] h-[98vh] max-w-none' // 98% fullscreen
}

// Root Modal component (alias for Dialog.Root)
const Modal = DialogPrimitive.Root

// Modal Trigger
const ModalTrigger = DialogPrimitive.Trigger

// Modal Portal
const ModalPortal = DialogPrimitive.Portal

// Modal Close
const ModalClose = DialogPrimitive.Close

// Modal Overlay with CSS variables
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] bg-black/50",
      className
    )}
    {...props}
  />
))
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

// Modal Content with size presets and CSS variables
const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean
    disableOutsideClick?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'master' | 'fullscreen'
  }
>(({ className, children, hideCloseButton, disableOutsideClick, size, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(
        "fixed left-[50%] top-[50%] z-[100] grid translate-x-[-50%] translate-y-[-50%]",
        "gap-3 sm:gap-4",
        "border border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] shadow-lg",
        "rounded-lg sm:rounded-lg",
        size ? modalSizes[size] : "max-w-lg w-full mx-4 h-auto max-h-[85vh]",
        // Responsive padding - smaller on mobile
        size !== 'master' && size !== 'fullscreen' && !className?.includes('p-0') && "p-4 sm:p-6",
        className
      )}
      onInteractOutside={(e) => {
        if (disableOutsideClick) {
          e.preventDefault()
        }
      }}
      {...props}
    >
      {children}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-[rgb(var(--bg-surface))] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-[rgb(var(--bg-hover))] data-[state=open]:text-[rgb(var(--fg-muted))]">
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--color-icon))]" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = DialogPrimitive.Content.displayName

// Modal Header with CSS variables
const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
ModalHeader.displayName = "ModalHeader"

// Modal Footer with CSS variables
const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
ModalFooter.displayName = "ModalFooter"

// Modal Title with CSS variables
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-[rgb(var(--fg-default))]",
      className
    )}
    {...props}
  />
))
ModalTitle.displayName = DialogPrimitive.Title.displayName

// Modal Description with CSS variables
const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-[rgb(var(--fg-muted))]",
      className
    )}
    {...props}
  />
))
ModalDescription.displayName = DialogPrimitive.Description.displayName

// Backwards compatibility aliases for existing code using Dialog*
export const Dialog = Modal
export const DialogTrigger = ModalTrigger
export const DialogPortal = ModalPortal
export const DialogClose = ModalClose
export const DialogOverlay = ModalOverlay
export const DialogContent = ModalContent
export const DialogHeader = ModalHeader
export const DialogFooter = ModalFooter
export const DialogTitle = ModalTitle
export const DialogDescription = ModalDescription

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
}
