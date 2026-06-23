import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[100px] w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-text-primary placeholder:text-gray-300 focus:outline-none focus:border-nimiq-yellow focus:ring-4 focus:ring-nimiq-yellow/15 transition-all disabled:opacity-50 resize-none leading-relaxed',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
