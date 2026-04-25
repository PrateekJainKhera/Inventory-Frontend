import * as React from 'react'
import { DropdownOption } from '../types'

export function useDropdownFiltering(
  allOptions: DropdownOption[],
  searchTerm: string,
  enableTextInput: boolean
) {
  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return allOptions
    return allOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allOptions, searchTerm])

  // Check if we should show "Create" option
  const showCreateOption = React.useMemo(() => {
    if (!enableTextInput || !searchTerm.trim()) return false
    const exactMatch = allOptions.some(
      opt => opt.label.toLowerCase() === searchTerm.toLowerCase()
    )
    return !exactMatch
  }, [enableTextInput, searchTerm, allOptions])

  return {
    filteredOptions,
    showCreateOption
  }
}
