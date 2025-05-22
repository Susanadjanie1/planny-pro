"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  // Ensure theme is only applied after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
