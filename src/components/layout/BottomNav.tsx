import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/browse', icon: Search, label: 'Browse' },
  { to: '/dashboard', icon: User, label: 'Mine' },
]

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-50">
      {/* Glass bar */}
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center px-4 pb-safe-bottom">
        {/* Left two tabs */}
        {NAV_ITEMS.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <TabItem key={to} to={to} icon={Icon} label={label} />
        ))}

        {/* FAB — Post bounty */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={() => navigate('/create')}
            className="w-14 h-14 rounded-full bg-nimiq-yellow shadow-lg shadow-nimiq-yellow/30 flex items-center justify-center active:scale-95 transition-transform duration-100"
          >
            <Plus size={24} strokeWidth={2.5} className="text-text-primary" />
          </button>
        </div>

        {/* Right tab */}
        {NAV_ITEMS.slice(2).map(({ to, icon: Icon, label }) => (
          <TabItem key={to} to={to} icon={Icon} label={label} />
        ))}
      </div>
    </nav>
  )
}

function TabItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex-1"
    >
      {({ isActive }) => (
        <div className={cn(
          'flex flex-col items-center gap-0.5 py-3 transition-colors',
          isActive ? 'text-nimiq-yellow' : 'text-text-secondary'
        )}>
          <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className={cn(
            'text-[10px] font-label font-medium transition-all',
            isActive ? 'opacity-100' : 'opacity-70'
          )}>
            {label}
          </span>
          {isActive && (
            <span className="absolute bottom-[calc(env(safe-area-inset-bottom)+2px)] w-1 h-1 rounded-full bg-nimiq-yellow" />
          )}
        </div>
      )}
    </NavLink>
  )
}
