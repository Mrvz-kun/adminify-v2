'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')
  const [isMounted, setIsMounted] = useState(false)

  // Safe access to localStorage after component mounts
  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    if (storedTheme) {
      setTheme(storedTheme)
    }
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme, isMounted])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!isMounted) return null // prevent hydration mismatch

  return (
    <label className="swap swap-rotate cursor-pointer">
      <input
        type="checkbox"
        onChange={toggleTheme}
        checked={theme === 'dark'}
        aria-label="Toggle theme"
      />

      {/* Sun icon (light mode) */}
      <Sun className="swap-off w-5 h-5 fill-current" />

      {/* Moon icon (dark mode) */}
      <Moon className="swap-on w-5 h-5 fill-current" />
    </label>
  )
}
