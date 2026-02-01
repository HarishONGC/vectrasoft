import { Moon, Sun } from 'lucide-react'
import { useContext } from 'react'
import { ThemeContext } from '../app/providers'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <Button
      variant="ghost"
      className="h-10 w-10 px-0 text-white hover:bg-white/20 border border-white/30 backdrop-blur-md"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
    </Button>
  )
}
