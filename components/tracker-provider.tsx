"use client"

import * as React from "react"
import type { Account, Trade } from "@/lib/types"
import {
  loadAccounts,
  loadTrades,
  saveAccounts,
  saveTrades,
  resetStorage,
  DEFAULT_ACCOUNTS,
  DEFAULT_TRADES,
} from "@/lib/storage"

interface TrackerContextValue {
  accounts: Account[]
  trades: Trade[]
  hydrated: boolean
  addTrade: (trade: Omit<Trade, "id">) => void
  updateTrade: (id: string, patch: Omit<Trade, "id">) => void
  deleteTrade: (id: string) => void
  updateAccount: (id: string, patch: Partial<Omit<Account, "id">>) => void
  resetAll: () => void
}

const TrackerContext = React.createContext<TrackerContextValue | null>(null)

function genId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = React.useState<Account[]>(DEFAULT_ACCOUNTS)
  const [trades, setTrades] = React.useState<Trade[]>(DEFAULT_TRADES)
  const [hydrated, setHydrated] = React.useState(false)

  // Hydrate from localStorage on mount (avoids SSR mismatch).
  React.useEffect(() => {
    setAccounts(loadAccounts())
    setTrades(loadTrades())
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (hydrated) saveAccounts(accounts)
  }, [accounts, hydrated])

  React.useEffect(() => {
    if (hydrated) saveTrades(trades)
  }, [trades, hydrated])

  const addTrade = React.useCallback((trade: Omit<Trade, "id">) => {
    setTrades((prev) => [{ ...trade, id: genId() }, ...prev])
  }, [])

  const updateTrade = React.useCallback(
    (id: string, patch: Omit<Trade, "id">) => {
      setTrades((prev) =>
        prev.map((t) => (t.id === id ? { ...patch, id } : t)),
      )
    },
    [],
  )

  const deleteTrade = React.useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateAccount = React.useCallback(
    (id: string, patch: Partial<Omit<Account, "id">>) => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      )
    },
    [],
  )

  const resetAll = React.useCallback(() => {
    resetStorage()
    setAccounts(DEFAULT_ACCOUNTS)
    setTrades(DEFAULT_TRADES)
  }, [])

  const value = React.useMemo<TrackerContextValue>(
    () => ({
      accounts,
      trades,
      hydrated,
      addTrade,
      updateTrade,
      deleteTrade,
      updateAccount,
      resetAll,
    }),
    [accounts, trades, hydrated, addTrade, updateTrade, deleteTrade, updateAccount, resetAll],
  )

  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  )
}

export function useTracker(): TrackerContextValue {
  const ctx = React.useContext(TrackerContext)
  if (!ctx) {
    throw new Error("useTracker must be used within a TrackerProvider")
  }
  return ctx
}
