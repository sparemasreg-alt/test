import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const useMobile = () => useMediaQuery('(max-width: 768px)')
export const useTablet = () => useMediaQuery('(max-width: 1024px)')
export const useDesktop = () => useMediaQuery('(min-width: 1025px)')
