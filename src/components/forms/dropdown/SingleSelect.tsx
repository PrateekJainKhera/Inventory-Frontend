'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DropdownOption } from './types'
import { getDropdownClassName, dropdownSharedStyles, DropdownSearch, ClearButton, OptionImage } from './Dropdown'

interface SingleSelectProps {
  value?: string | number | string[]
  onValueChange: (value: string | number | string[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled: boolean
  placeholder: string
  error: boolean
  clearable: boolean
  autoWidth: boolean
  triggerClassName?: string
  className?: string
  searchable: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredOptions: DropdownOption[]
  allOptions: DropdownOption[] // Added: all options (including non-filtered)
  loading: boolean
  emptyMessage: string
  showCreateOption: boolean
  effectiveCreateOption?: (inputValue: string) => DropdownOption | Promise<DropdownOption>
  isCreating: boolean
  allowCustomInput: boolean
  createOptionLabel: string
  handleCreateOption: () => void
  handleClear: (e: React.MouseEvent) => void
  customFooter?: React.ReactNode
  variant?: 'default' | 'compact' | 'detailed'
  size?: 'sm' | 'md' | 'lg'
}

export function SingleSelect({
  value,
  onValueChange,
  open,
  onOpenChange,
  disabled,
  placeholder,
  error,
  clearable,
  autoWidth,
  triggerClassName,
  className,
  searchable,
  searchTerm,
  setSearchTerm,
  filteredOptions,
  allOptions,
  loading,
  emptyMessage,
  showCreateOption,
  effectiveCreateOption,
  isCreating,
  allowCustomInput,
  createOptionLabel,
  handleCreateOption,
  handleClear,
  customFooter,
  variant = 'default',
  size = 'md'
}: SingleSelectProps) {
  // Find selected option from ALL options (not just filtered) to show label in trigger
  // This ensures the selected value displays correctly even when options are still loading
  const selectedOption = React.useMemo(() => {
    return allOptions.find(opt => opt.value?.toString() === value?.toString())
  }, [allOptions, value])

  // For combobox mode with allowCustomInput, use direct input value
  const displayValue = React.useMemo(() => {
    if (allowCustomInput && value && !selectedOption) {
      // If there's a value but no matching option, it's a custom value
      return value.toString()
    }
    return selectedOption?.label || ''
  }, [allowCustomInput, value, selectedOption])

  // Track highlighted option index for keyboard navigation
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)

  // Reset highlighted index when options change or dropdown opens
  React.useEffect(() => {
    if (open) {
      // Find currently selected option index, or default to 0
      const currentIndex = filteredOptions.findIndex(opt => opt.value?.toString() === value?.toString())
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0)
    }
  }, [open, filteredOptions, value])

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!open) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (filteredOptions.length > 0) {
          setHighlightedIndex(prev => {
            const next = prev + 1
            return next >= filteredOptions.length ? 0 : next
          })
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (filteredOptions.length > 0) {
          setHighlightedIndex(prev => {
            const next = prev - 1
            return next < 0 ? filteredOptions.length - 1 : next
          })
        }
        break
      case 'Tab':
      case 'Enter':
        e.preventDefault()
        if (filteredOptions.length > 0) {
          // Select highlighted option from list
          const selectedOpt = filteredOptions[highlightedIndex]
          if (selectedOpt && !selectedOpt.disabled) {
            onValueChange(selectedOpt.value)
            onOpenChange(false)
          }
        } else if (allowCustomInput && searchTerm.trim()) {
          // No matching options but custom input allowed - create custom value
          handleCreateOption()
        }
        break
      case 'Escape':
        e.preventDefault()
        onOpenChange(false)
        break
    }
  }, [open, filteredOptions, highlightedIndex, onValueChange, onOpenChange, allowCustomInput, searchTerm, handleCreateOption])

  return (
    <SelectPrimitive.Root
      value={value?.toString()}
      onValueChange={(newValue: string) => onValueChange(newValue)}
      open={open}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <div className="relative" onKeyDown={handleKeyDown}>
        <SelectPrimitive.Trigger
          suppressHydrationWarning
          className={cn(
            "group",
            dropdownSharedStyles.trigger.base,
            dropdownSharedStyles.trigger.sizes[size],
            dropdownSharedStyles.trigger.variants[variant],
            dropdownSharedStyles.trigger.focus,
            error ? dropdownSharedStyles.trigger.error : dropdownSharedStyles.trigger.normal,
            autoWidth ? dropdownSharedStyles.trigger.autoWidth : dropdownSharedStyles.trigger.fullWidth,
            disabled && dropdownSharedStyles.trigger.disabled,
            "pl-3 py-2 pr-1 [&>span]:line-clamp-1",
            className,
            triggerClassName
          )}
        >
          {displayValue ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {selectedOption?.image && (
                <OptionImage image={selectedOption.image} alt={displayValue} />
              )}
              <span className="truncate text-xs">{displayValue}</span>
            </div>
          ) : (
            <span className="text-[rgb(var(--fg-subtle))] font-normal text-xs">{placeholder}</span>
          )}
          <div className="flex items-center gap-0.5 flex-shrink-0 pr-1">
            {clearable && value && (
              <ClearButton onClear={handleClear} disabled={disabled} />
            )}
            <SelectPrimitive.Icon asChild>
              <div className="pr-1 pl-0.5">
                <ChevronDown className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
              </div>
            </SelectPrimitive.Icon>
          </div>
        </SelectPrimitive.Trigger>
      </div>

      <SelectPrimitive.Portal container={typeof document !== 'undefined' ? document.body : undefined}>
        <SelectPrimitive.Content
          className={getDropdownClassName.content()}
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={true}
          sticky="always"
          collisionPadding={16}
        >
          {searchable && (
            <DropdownSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          <SelectPrimitive.Viewport className={dropdownSharedStyles.viewport}>
            {/* Create Option Button for Single Select */}
            {showCreateOption && effectiveCreateOption && (
              <button
                type="button"
                onClick={handleCreateOption}
                disabled={isCreating}
                className={dropdownSharedStyles.createButton}
              >
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">+</span>
                    <span>{allowCustomInput ? 'Add' : createOptionLabel} &quot;{searchTerm}&quot;</span>
                  </>
                )}
              </button>
            )}

            {loading ? (
              <div className="py-6 text-center text-sm text-fg-muted bg-bg-surface">
                Loading...
              </div>
            ) : filteredOptions.length === 0 && !showCreateOption ? (
              <div className="py-6 text-center text-sm text-fg-muted bg-bg-surface">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions
                .filter(option => option.value != null && option.value !== '') // Filter out null/undefined/empty values
                .map((option, index) => {
                  const isHighlighted = index === highlightedIndex
                  return (
                    <SelectPrimitive.Item
                      key={option.key || `${option.value}-${index}`}
                      value={String(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        getDropdownClassName.item(),
                        isHighlighted && "bg-[rgb(var(--bg-hover))]"
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <SelectPrimitive.ItemIndicator>
                          <Check className="h-4 w-4" />
                        </SelectPrimitive.ItemIndicator>
                      </span>
                      <SelectPrimitive.ItemText>
                        <div className="min-w-0 flex items-center gap-2">
                          {option.image && (
                            <OptionImage image={option.image} alt={option.label} />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-[rgb(var(--fg-muted))] truncate">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  )
                })
            )}
          </SelectPrimitive.Viewport>

          {/* Custom Footer - Isolated from Radix event handling */}
          {customFooter && (
            <div
              onMouseDownCapture={(e) => e.stopPropagation()}
              onClickCapture={(e) => e.stopPropagation()}
              onPointerDownCapture={(e) => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            >
              {customFooter}
            </div>
          )}
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
