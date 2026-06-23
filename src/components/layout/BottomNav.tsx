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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-50">
      <div className="bg-white border-t border-gray-100 flex items-center px-2 pb-safe">
        {NAV_ITEMS.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <TabItem key={to} to={to} icon={Icon} label={label} />
        ))}

        {/* FAB */}
        <div className="flex-1 flex justify-center items-center -translate-y-3">
          <button
            onClick={() => navigate('/create')}
            className="w-14 h-14 rounded-full bg-nimiq-yellow flex items-center justify-center press"
            style={{ boxShadow: '0 4px 20px rgba(245,166,35,0.45)' }}
          >
            <Plus size={26} strokeWidth={2.5} className="text-[#1A1A1A]" />
          </button>
        </div>

        {NAV_ITEMS.slice(2).map(({ to, icon: Icon, label }) => (
          <TabItem key={to} to={to} icon={Icon} label={label} />
        ))}
      </div>
    </div>
  )
}

function TabItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink to={to} end={to === '/'} className="flex-1">
      {({ isActive }) => (
        <div className={cn(
          'flex flex-col items-center gap-0.5 py-3 transition-all duration-150',
          isActive ? 'text-nimiq-yellow' : 'text-gray-400'
        )}>
          <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className={cn('text-[10px] font-semibold tracking-wide uppercase transition-all', isActive ? 'opacity-100' : 'opacity-60')}>
            {label}
          </span>
        </div>
      )}
    </NavLink>
  )
}
