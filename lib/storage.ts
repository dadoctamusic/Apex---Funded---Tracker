import type { Account, Trade } from "@/lib/types"

const ACCOUNTS_KEY = "apex-tracker:accounts"
const TRADES_KEY = "apex-tracker:trades"

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    name: "Account A",
    startingBalance: 48552.22,
    trailingThreshold: 46000,
    dailyLossLimit: 1500,
    maxDrawdown: 2500,
    fundedStatus: "Active",
  },
  {
    id: "acc-2",
    name: "Account B",
    startingBalance: 97412.48,
    trailingThreshold: 94500,
    dailyLossLimit: 2200,
    maxDrawdown: 3000,
    fundedStatus: "Active",
  },
  {
    id: "acc-3",
    name: "Account C",
    startingBalance: 25251.7,
    trailingThreshold: 24000,
    dailyLossLimit: 1000,
    maxDrawdown: 1500,
    fundedStatus: "Active",
  },
]

export const DEFAULT_TRADES: Trade[] = []

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function loadAccounts(): Account[] {
  if (!isBrowser()) return DEFAULT_ACCOUNTS
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return DEFAULT_ACCOUNTS
    return JSON.parse(raw) as Account[]
  } catch {
    return DEFAULT_ACCOUNTS
  }
}

export function loadTrades(): Trade[] {
  if (!isBrowser()) return DEFAULT_TRADES
  try {
    const raw = window.localStorage.getItem(TRADES_KEY)
    if (!raw) return DEFAULT_TRADES
    return JSON.parse(raw) as Trade[]
  } catch {
    return DEFAULT_TRADES
  }
}

export function saveAccounts(accounts: Account[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function saveTrades(trades: Trade[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(TRADES_KEY, JSON.stringify(trades))
}

export function resetStorage(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(ACCOUNTS_KEY)
  window.localStorage.removeItem(TRADES_KEY)
}
