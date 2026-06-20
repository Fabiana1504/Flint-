import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-12 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/40 focus:border-nimiq-yellow transition-colors disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
