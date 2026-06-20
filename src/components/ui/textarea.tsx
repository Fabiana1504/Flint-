import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[100px] w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/40 focus:border-nimiq-yellow transition-colors disabled:opacity-50 resize-none',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
