import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { connectWallet, isInsideNimiqPay, type NimiqWallet } from '@/lib/nimiq'
import { getOrCreateUser } from '@/lib/supabase'
import type { User } from '@/types'

interface WalletContextValue {
  wallet: NimiqWallet | null
  user: User | null
  connecting: boolean
  insideNimiqPay: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<NimiqWallet | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [connecting, setConnecting] = useState(false)
  const insideNimiqPay = isInsideNimiqPay()

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const nimiqWallet = await connectWallet()
      setWallet(nimiqWallet)
      const dbUser = await getOrCreateUser(nimiqWallet.address)
      setUser(dbUser)
    } catch (err) {
      console.error('Wallet connection failed:', err)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet(null)
    setUser(null)
  }, [])

  // Inside Nimiq Pay: auto-connect on load, wallet is already available
  useEffect(() => {
    if (insideNimiqPay) {
      connect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WalletContext.Provider value={{ wallet, user, connecting, insideNimiqPay, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
