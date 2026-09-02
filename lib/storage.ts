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
    startingBalance: 25251.70,
    trailingThreshold: 24000,
    dailyLossLimit: 1000,
    maxDrawdown: 1500,
    fundedStatus: "Active",
  },
]
