import { useState, useEffect, useCallback } from 'react'
import { fetchBounties, fetchBountyById } from '@/lib/supabase'
import type { Bounty, BountyFilters } from '@/types'

export function useBounties(filters?: BountyFilters) {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBounties(filters)
      setBounties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bounties')
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.status])

  useEffect(() => { load() }, [load])

  return { bounties, loading, error, refetch: load }
}

export function useBounty(id: string) {
  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchBountyById(id)
      .then(setBounty)
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [id])

  return { bounty, loading, error, setBounty }
}
