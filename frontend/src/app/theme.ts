const KEY = 'cctv.theme'

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  const raw = localStorage.getItem(KEY)
  if (raw === 'dark' || raw === 'light') return raw
  return 'light'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  localStorage.setItem(KEY, theme)
}
