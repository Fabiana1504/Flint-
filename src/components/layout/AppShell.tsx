import { Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { useTheme } from '@/context/ThemeContext'
import { useLang } from '@/context/LangContext'

export function AppShell() {
  const { theme, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang } = useLang()

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="relative w-full max-w-app min-h-screen flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.07)]">

        {/* Floating theme + language toggles */}
        <div className="fixed top-3 right-3 z-[60] flex items-center gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="h-8 px-2.5 rounded-xl text-[11px] font-extrabold tracking-wide backdrop-blur-md border transition-all press"
              style={{
                background: 'rgba(0,0,0,0.08)',
                borderColor: 'rgba(0,0,0,0.08)',
                color: 'var(--color-text-primary)',
              }}
            >
              {lang === 'en' ? 'ES' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all press"
              style={{
                background: 'rgba(0,0,0,0.08)',
                borderColor: 'rgba(0,0,0,0.08)',
                color: 'var(--color-text-primary)',
              }}
            >
              {theme === 'dark'
                ? <Sun size={14} strokeWidth={2.5} />
                : <Moon size={14} strokeWidth={2.5} />
              }
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
