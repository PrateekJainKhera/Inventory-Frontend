'use client'

import { useState, useEffect } from 'react'

/**
 * useMediaQuery Hook
 *
 * Checks if a media query matches and returns the result.
 * Updates on window resize.
 *
 * @param query - CSS media query string (e.g., '(min-width: 1024px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Legacy browsers
      media.addListener(listener)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}
