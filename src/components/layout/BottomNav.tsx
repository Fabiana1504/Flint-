import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LEFT  = [
  { to: '/',       icon: Home,   label: 'Home'   },
  { to: '/browse', icon: Search, label: 'Browse' },
]
const NAV_RIGHT = [
  { to: '/dashboard', icon: User, label: 'Mine' },
]

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-50">
      <div className="relative">

        {/* FAB — absolutely centered above the bar, no translate tricks */}
        <button
          onClick={() => navigate('/create')}
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-[52px] h-[52px] rounded-2xl flex items-center justify-center press"
          style={{
            background: 'linear-gradient(145deg, #F7C04A 0%, #F5A623 55%, #E8951A 100%)',
            boxShadow: '0 8px 24px rgba(245,166,35,0.6), 0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Plus size={22} strokeWidth={2.8} className="text-[#18181B]" />
        </button>

        {/* Bar */}
        <div
          className="border-t border-gray-100 flex items-stretch"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          }}
        >
          {/* Left tabs */}
          {NAV_LEFT.map(({ to, icon: Icon, label }) => (
            <TabItem key={to} to={to} icon={Icon} label={label} />
          ))}

          {/* Center spacer — same flex weight as a tab so FAB lands at 50% */}
          <div className="flex-1" />

          {/* Right tabs */}
          {NAV_RIGHT.map(({ to, icon: Icon, label }) => (
            <TabItem key={to} to={to} icon={Icon} label={label} />
          ))}

          {/* Mirror spacer so right side is balanced with left's 2 tabs */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  )
}

function TabItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink to={to} end={to === '/'} className="flex-1">
      {({ isActive }) => (
        <div className={cn(
          'flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-1 transition-all duration-150 press',
          isActive ? 'text-nimiq-yellow' : 'text-gray-400'
        )}>
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
            isActive ? 'bg-nimiq-yellow/12' : ''
          )}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          </div>
          <span className={cn(
            'text-[10px] font-bold tracking-wide uppercase transition-all',
            isActive ? 'opacity-100' : 'opacity-40'
          )}>
            {label}
          </span>
        </div>
      )}
    </NavLink>
  )
}
