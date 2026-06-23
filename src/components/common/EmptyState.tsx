
interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = '🔍', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 flex items-center justify-center mb-5 text-4xl"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-text-primary text-lg mb-1.5">{title}</h3>
      <p className="text-text-secondary text-sm max-w-[230px] leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 h-12 px-6 rounded-2xl font-bold text-sm text-nimiq-dark press"
          style={{ background: 'linear-gradient(135deg, #F5A623, #F7C04A)', boxShadow: '0 4px 16px rgba(245,166,35,0.4)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
