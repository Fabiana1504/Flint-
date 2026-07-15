import { type ElementType } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/',          icon: Home,   label: 'Home'   },
  { to: '/browse',    icon: Search, label: 'Browse' },
  { to: '/dashboard', icon: User,   label: 'Mine'   },
] as const

function matchRoute(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname.startsWith(to)
}

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isCreate = pathname === '/create'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-label="Main navigation"
    >
      <div
        className="pointer-events-auto w-full max-w-app px-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-4 rounded-[1.625rem] border border-black/[0.06] bg-white/92 backdrop-blur-2xl p-1 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          {TABS.slice(0, 2).map(({ to, icon, label }) => (
            <NavTab key={to} to={to} icon={icon} label={label} active={matchRoute(pathname, to)} />
          ))}

          <button
            type="button"
            onClick={() => navigate('/create')}
            className="press min-w-0 flex flex-col items-center justify-center py-2"
            aria-label="Post a task"
            aria-current={isCreate ? 'page' : undefined}
          >
            <span
              className={cn(
                'font-display font-extrabold text-[11px] tracking-wide px-3.5 py-2 rounded-xl transition-all duration-200',
                isCreate ? 'text-white scale-105' : 'text-nimiq-dark',
              )}
              style={{
                background: isCreate
                  ? 'linear-gradient(145deg, #E8951A 0%, #F5A623 50%, #F7C04A 100%)'
                  : 'linear-gradient(145deg, #F7C04A 0%, #F5A623 60%, #E8951A 100%)',
                boxShadow: isCreate
                  ? '0 4px 16px rgba(245,166,35,0.5), inset 0 1px 0 rgba(255,255,255,0.35)'
                  : '0 2px 10px rgba(245,166,35,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              Post
            </span>
          </button>

          {TABS.slice(2).map(({ to, icon, label }) => (
            <NavTab key={to} to={to} icon={icon} label={label} active={matchRoute(pathname, to)} />
          ))}
        </div>
      </div>
    </nav>
  )
}

function NavTab({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string
  icon: ElementType
  label: string
  active: boolean
}) {
  return (
    <NavLink to={to} end={to === '/'} className="press min-w-0">
      <div
        className={cn(
          'flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-200',
          active && 'bg-nimiq-yellow/10',
        )}
      >
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
            active ? 'text-nimiq-yellow' : 'text-gray-400',
          )}
        >
          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={cn('text-[10px] font-semibold truncate', active ? 'text-nimiq-yellow' : 'text-gray-400')}>
          {label}
        </span>
      </div>
    </NavLink>
  )
}
