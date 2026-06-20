import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon = '🔍', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4 select-none">{icon}</span>
      <h3 className="font-display font-semibold text-text-primary text-h3 mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-[260px] leading-relaxed">{description}</p>
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
