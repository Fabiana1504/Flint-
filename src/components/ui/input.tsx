import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-13 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-text-primary placeholder:text-gray-300 focus:outline-none focus:border-nimiq-yellow focus:ring-4 focus:ring-nimiq-yellow/15 transition-all disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
