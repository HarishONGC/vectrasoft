import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useEffect, useState, type PropsWithChildren } from 'react'
import { applyTheme, getTheme, type Theme } from './theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => getTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
    </QueryClientProvider>
  )
}

export const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({
  theme: 'dark',
  setTheme: () => {},
})
