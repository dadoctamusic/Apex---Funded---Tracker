import type { Account, AccountMetrics, Trade } from "@/lib/types"

export function computeTradePnl(
  direction: Trade["direction"],
  contracts: number,
  entryPrice: number,
  exitPrice: number,
): number {
  const diff = exitPrice - entryPrice
  const signed = direction === "Long" ? diff : -diff
  return Number((signed * contracts).toFixed(2))
}

function sortByDate(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => a.date.localeCompare(b.date))
}

/** Aggregate P&L grouped by calendar day, sorted ascending. */
export function dailyPnl(trades: Trade[]): { date: string; pnl: number }[] {
  const map = new Map<string, number>()
  for (const t of trades) {
    map.set(t.date, (map.get(t.date) ?? 0) + t.pnl)
  }
  return [...map.entries()]
    .map(([date, pnl]) => ({ date, pnl: Number(pnl.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Aggregate P&L grouped by month (yyyy-mm), sorted ascending. */
export function monthlyPnl(trades: Trade[]): { month: string; pnl: number }[] {
  const map = new Map<string, number>()
  for (const t of trades) {
    const month = t.date.slice(0, 7)
    map.set(month, (map.get(month) ?? 0) + t.pnl)
  }
  return [...map.entries()]
    .map(([month, pnl]) => ({ month, pnl: Number(pnl.toFixed(2)) }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/** Running equity curve from starting balance across time-ordered trades. */
export function equityCurve(
  startingBalance: number,
  trades: Trade[],
): { index: number; label: string; equity: number }[] {
  const sorted = sortByDate(trades)
  let equity = startingBalance
  const points = [
    { index: 0, label: "Start", equity: Number(startingBalance.toFixed(2)) },
  ]
  sorted.forEach((t, i) => {
    equity += t.pnl
    points.push({
      index: i + 1,
      label: t.date,
      equity: Number(equity.toFixed(2)),
    })
  })
  return points
}

export function accountMetrics(account: Account, trades: Trade[]): AccountMetrics {
  const netPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
  const currentBalance = account.startingBalance + netPnl
  const distanceToThreshold = currentBalance - account.trailingThreshold

  const wins = trades.filter((t) => t.pnl > 0)
  const losses = trades.filter((t) => t.pnl < 0)
  const totalTrades = trades.length
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0

  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

  // Consistency: how balanced daily profit is. Prop firms flag when a single
  // day dominates total profit. 100% = perfectly spread, lower = concentrated.
  const days = dailyPnl(trades)
  const profitableDays = days.filter((d) => d.pnl > 0)
  const totalDailyProfit = profitableDays.reduce((s, d) => s + d.pnl, 0)
  const bestDay = profitableDays.reduce((max, d) => Math.max(max, d.pnl), 0)
  const consistency =
    totalDailyProfit > 0
      ? Math.max(0, Math.min(100, (1 - bestDay / totalDailyProfit) * 100))
      : 0

  // At risk when within 20% of the trailing threshold buffer or already below.
  const buffer = account.startingBalance - account.trailingThreshold
  const atRisk =
    distanceToThreshold <= 0 ||
    (buffer > 0 && distanceToThreshold / buffer <= 0.25)

  return {
    currentBalance: Number(currentBalance.toFixed(2)),
    netPnl: Number(netPnl.toFixed(2)),
    distanceToThreshold: Number(distanceToThreshold.toFixed(2)),
    winRate: Number(winRate.toFixed(1)),
    profitFactor: Number.isFinite(profitFactor)
      ? Number(profitFactor.toFixed(2))
      : profitFactor,
    consistency: Number(consistency.toFixed(1)),
    totalTrades,
    atRisk,
  }
}

export function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : ""
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatCompactCurrency(value: number): string {
  const sign = value < 0 ? "-" : ""
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`
}

export function formatProfitFactor(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "∞"
}
