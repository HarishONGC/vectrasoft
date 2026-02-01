import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../app/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'secondary', size = 'md', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:opacity-50 disabled:pointer-events-none'

  const sizes: Record<NonNullable<Props['size']>, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }

  const variants: Record<Variant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-surface2 text-text hover:bg-surface2/70',
    ghost: 'bg-transparent text-text hover:bg-surface2',
    danger: 'bg-bad text-white hover:bg-bad/90',
  }

  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />
}
