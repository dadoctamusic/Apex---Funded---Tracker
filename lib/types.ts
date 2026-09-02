export type FundedStatus = "Evaluation" | "Funded" | "Passed" | "Failed"

export type TradeDirection = "Long" | "Short"

export interface Account {
  id: string
  name: string
  startingBalance: number
  /** The trailing drawdown threshold as an absolute account value. */
  trailingThreshold: number
  /** Maximum intraday loss allowed before a rule breach. */
  dailyLossLimit: number
  /** Max trailing drawdown amount (distance from peak). */
  maxDrawdown: number
  fundedStatus: FundedStatus
}

export interface Trade {
  id: string
  accountId: string
  date: string // ISO yyyy-mm-dd
  symbol: string
  direction: TradeDirection
  contracts: number
  entryPrice: number
  exitPrice: number
  pnl: number
  notes?: string
  screenshotUrl?: string
}

/** Fully derived account metrics computed from trades. */
export interface AccountMetrics {
  currentBalance: number
  netPnl: number
  distanceToThreshold: number
  winRate: number
  profitFactor: number
  consistency: number
  totalTrades: number
  atRisk: boolean
}
