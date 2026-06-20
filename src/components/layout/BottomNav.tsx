import { NavLink } from 'react-router-dom'
import { Home, Search, PlusCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/browse', icon: Search, label: 'Browse' },
  { to: '/create', icon: PlusCircle, label: 'Post' },
  { to: '/dashboard', icon: User, label: 'Mine' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-safe-bottom z-50">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-3 px-4 rounded-2xl transition-colors min-w-[60px]',
              isActive ? 'text-nimiq-yellow' : 'text-text-secondary'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-label font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
