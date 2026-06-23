import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/',          icon: Home,   label: 'Home'   },
  { to: '/browse',    icon: Search, label: 'Browse' },
  { to: '/dashboard', icon: User,   label: 'Mine'   },
]

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-50">
      <div
        className="border-t border-gray-100 flex items-center px-2"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {NAV.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <TabItem key={to} to={to} icon={Icon} label={label} />
        ))}

        {/* FAB */}
        <div className="flex-1 flex justify-center items-center -translate-y-4">
          <button
            onClick={() => navigate('/create')}
            className="w-16 h-16 rounded-full flex items-center justify-center press"
            style={{
              background: 'linear-gradient(145deg, #F7C04A 0%, #F5A623 60%, #E8951A 100%)',
              boxShadow: '0 6px 24px rgba(245,166,35,0.55), 0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <Plus size={28} strokeWidth={2.5} className="text-nimiq-dark" />
          </button>
        </div>

        {NAV.slice(2).map(({ to, icon: Icon, label }) => (
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
        <div className={cn('flex flex-col items-center gap-0.5 py-2.5 transition-all duration-150 press', isActive ? 'text-nimiq-yellow' : 'text-gray-400')}>
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-all', isActive ? 'bg-nimiq-yellow/12' : '')}>
            <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
          </div>
          <span className={cn('text-[10px] font-bold tracking-wide uppercase transition-all', isActive ? 'opacity-100' : 'opacity-50')}>
            {label}
          </span>
        </div>
      )}
    </NavLink>
  )
}
