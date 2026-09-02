import type { Account, Trade } from "@/lib/types"

const ACCOUNTS_KEY = "apex-tracker:accounts"
const TRADES_KEY = "apex-tracker:trades"

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    name: "Apex 50K Eval",
    startingBalance: 50000,
    trailingThreshold: 47500,
    dailyLossLimit: 1500,
    maxDrawdown: 2500,
    fundedStatus: "Evaluation",
  },
  {
    id: "acc-2",
    name: "Apex 100K PA",
    startingBalance: 100000,
    trailingThreshold: 97000,
    dailyLossLimit: 2200,
    maxDrawdown: 3000,
    fundedStatus: "Funded",
  },
  {
    id: "acc-3",
    name: "Apex 150K PA",
    startingBalance: 150000,
    trailingThreshold: 145000,
    dailyLossLimit: 3000,
    maxDrawdown: 5000,
    fundedStatus: "Funded",
  },
]

const SYMBOLS = ["ES", "NQ", "MNQ", "MES", "CL", "GC"]

function d(month: number, day: number): string {
  return `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export const DEFAULT_TRADES: Trade[] = [
  // Account 1 — 50K eval, modestly profitable, mixed
  { id: "t1", accountId: "acc-1", date: d(7, 3), symbol: "MNQ", direction: "Long", contracts: 4, entryPrice: 20150, exitPrice: 20195, pnl: 360, notes: "Opening range breakout", screenshotUrl: "" },
  { id: "t2", accountId: "acc-1", date: d(7, 3), symbol: "MES", direction: "Short", contracts: 6, entryPrice: 5620, exitPrice: 5610, pnl: 300, notes: "Faded the spike" },
  { id: "t3", accountId: "acc-1", date: d(7, 8), symbol: "MNQ", direction: "Long", contracts: 3, entryPrice: 20280, exitPrice: 20250, pnl: -180, notes: "Stopped out, chop" },
  { id: "t4", accountId: "acc-1", date: d(7, 15), symbol: "MES", direction: "Long", contracts: 5, entryPrice: 5640, exitPrice: 5658, pnl: 450, notes: "Trend day, held runner" },
  { id: "t5", accountId: "acc-1", date: d(7, 22), symbol: "MNQ", direction: "Short", contracts: 4, entryPrice: 20410, exitPrice: 20440, pnl: -240, notes: "News reversal" },
  { id: "t6", accountId: "acc-1", date: d(8, 5), symbol: "MES", direction: "Long", contracts: 6, entryPrice: 5665, exitPrice: 5680, pnl: 450, notes: "VWAP bounce" },
  { id: "t7", accountId: "acc-1", date: d(8, 12), symbol: "MNQ", direction: "Long", contracts: 3, entryPrice: 20500, exitPrice: 20535, pnl: 315, notes: "Continuation" },

  // Account 2 — 100K funded, strong performer
  { id: "t8", accountId: "acc-2", date: d(7, 2), symbol: "ES", direction: "Long", contracts: 3, entryPrice: 5610, exitPrice: 5628, pnl: 675, notes: "Gap fill" },
  { id: "t9", accountId: "acc-2", date: d(7, 9), symbol: "NQ", direction: "Long", contracts: 2, entryPrice: 20200, exitPrice: 20260, pnl: 480, notes: "Momentum long" },
  { id: "t10", accountId: "acc-2", date: d(7, 9), symbol: "ES", direction: "Short", contracts: 2, entryPrice: 5635, exitPrice: 5628, pnl: 175, notes: "Scalp" },
  { id: "t11", accountId: "acc-2", date: d(7, 16), symbol: "NQ", direction: "Short", contracts: 2, entryPrice: 20380, exitPrice: 20420, pnl: -320, notes: "Wrong side of trend" },
  { id: "t12", accountId: "acc-2", date: d(7, 24), symbol: "CL", direction: "Long", contracts: 3, entryPrice: 78.4, exitPrice: 79.1, pnl: 630, notes: "Inventory play" },
  { id: "t13", accountId: "acc-2", date: d(8, 1), symbol: "ES", direction: "Long", contracts: 3, entryPrice: 5660, exitPrice: 5685, pnl: 940, notes: "Breakout hold" },
  { id: "t14", accountId: "acc-2", date: d(8, 8), symbol: "NQ", direction: "Long", contracts: 2, entryPrice: 20520, exitPrice: 20505, pnl: -120, notes: "Trailed too tight" },
  { id: "t15", accountId: "acc-2", date: d(8, 14), symbol: "ES", direction: "Long", contracts: 2, entryPrice: 5690, exitPrice: 5712, pnl: 550, notes: "Pullback entry" },

  // Account 3 — 150K funded, currently at risk (drawdown pressure)
  { id: "t16", accountId: "acc-3", date: d(7, 7), symbol: "GC", direction: "Long", contracts: 2, entryPrice: 2410, exitPrice: 2402, pnl: -1600, notes: "Broke support" },
  { id: "t17", accountId: "acc-3", date: d(7, 11), symbol: "NQ", direction: "Long", contracts: 3, entryPrice: 20300, exitPrice: 20340, pnl: 720, notes: "Recovered some" },
  { id: "t18", accountId: "acc-3", date: d(7, 18), symbol: "ES", direction: "Short", contracts: 3, entryPrice: 5650, exitPrice: 5668, pnl: -1350, notes: "Squeeze against me" },
  { id: "t19", accountId: "acc-3", date: d(7, 29), symbol: "CL", direction: "Short", contracts: 4, entryPrice: 79.2, exitPrice: 78.6, pnl: 720, notes: "Range short" },
  { id: "t20", accountId: "acc-3", date: d(8, 6), symbol: "NQ", direction: "Long", contracts: 2, entryPrice: 20480, exitPrice: 20455, pnl: -1000, notes: "Overtraded, revenge" },
  { id: "t21", accountId: "acc-3", date: d(8, 13), symbol: "ES", direction: "Long", contracts: 2, entryPrice: 5695, exitPrice: 5705, pnl: 500, notes: "Small win, rebuilding" },
]

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function loadAccounts(): Account[] {
  if (!isBrowser()) return DEFAULT_ACCOUNTS
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return DEFAULT_ACCOUNTS
    const parsed = JSON.parse(raw) as Account[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS
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
