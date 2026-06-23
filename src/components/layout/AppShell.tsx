import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="relative w-full max-w-app min-h-screen flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.07)]">
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
