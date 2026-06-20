import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { Browse } from '@/pages/Browse'
import { BountyDetail } from '@/pages/BountyDetail'
import { CreateBounty } from '@/pages/CreateBounty'
import { SubmitWork } from '@/pages/SubmitWork'
import { Dashboard } from '@/pages/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/bounty/:id" element={<BountyDetail />} />
        <Route path="/bounty/:id/submit" element={<SubmitWork />} />
        <Route path="/create" element={<CreateBounty />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
