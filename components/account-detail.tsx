"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/status-badge"
import { PnlValue } from "@/components/pnl-value"
import { useTracker } from "@/components/tracker-provider"
import {
  accountMetrics,
  formatCurrency,
  formatProfitFactor,
} from "@/lib/calculations"
import { cn } from "@/lib/utils"
import type { Account } from "@/lib/types"

export function AccountDetail({ account }: { account: Account }) {
  const { trades } = useTracker()
  const accountTrades = React.useMemo(
    () => trades.filter((t) => t.accountId === account.id),
    [trades, account.id],
  )
  const metrics = React.useMemo(
    () => accountMetrics(account, accountTrades),
    [account, accountTrades],
  )

  const buffer = account.startingBalance - account.trailingThreshold
  const used = buffer > 0 ? metrics.currentBalance - account.trailingThreshold : 0
  const bufferPct = buffer > 0 ? Math.max(0, Math.min(100, (used / buffer) * 100)) : 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2">
                {account.name}
                <StatusBadge status={account.fundedStatus} />
              </CardTitle>
              <CardDescription>
                {formatCurrency(account.startingBalance)} starting balance ·{" "}
                {metrics.totalTrades} trades
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase">Balance</p>
              <p className="font-mono text-2xl font-semibold tabular-nums">
                {formatCurrency(metrics.currentBalance)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Metric label="Net P&L">
            <PnlValue value={metrics.netPnl} className="text-lg font-semibold" />
          </Metric>
          <Metric label="Win Rate">
            <span className="text-lg font-semibold tabular-nums">
              {metrics.winRate}%
            </span>
          </Metric>
          <Metric label="Profit Factor">
            <span
              className={cn(
                "text-lg font-semibold tabular-nums",
                metrics.profitFactor >= 1.5
                  ? "text-profit"
                  : metrics.profitFactor < 1
                    ? "text-loss"
                    : "text-foreground",
              )}
            >
              {formatProfitFactor(metrics.profitFactor)}
            </span>
          </Metric>
          <Metric label="Consistency">
            <span className="text-lg font-semibold tabular-nums">
              {metrics.consistency}%
            </span>
          </Metric>
          <Metric label="Daily Loss Limit">
            <span className="font-mono text-lg font-semibold tabular-nums">
              {formatCurrency(account.dailyLossLimit)}
            </span>
          </Metric>
          <Metric label="Max Drawdown">
            <span className="font-mono text-lg font-semibold tabular-nums">
              {formatCurrency(account.maxDrawdown)}
            </span>
          </Metric>
        </CardContent>
      </Card>

      <Card className={cn(metrics.atRisk && "border-loss/40")}>
        <CardHeader>
          <CardTitle className="text-base">Trailing Drawdown</CardTitle>
          <CardDescription>Distance to breach threshold</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="flex items-end justify-between">
              <span className="text-xs text-muted-foreground uppercase">
                Buffer remaining
              </span>
              <PnlValue
                value={metrics.distanceToThreshold}
                showPlus={false}
                className="text-lg font-semibold"
              />
            </div>
            <Progress
              value={bufferPct}
              className={cn(
                "mt-2",
                metrics.atRisk
                  ? "[&_[data-slot=progress-indicator]]:bg-loss"
                  : bufferPct < 50
                    ? "[&_[data-slot=progress-indicator]]:bg-chart-3"
                    : "[&_[data-slot=progress-indicator]]:bg-profit",
              )}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Threshold</span>
            <span className="font-mono tabular-nums">
              {formatCurrency(account.trailingThreshold)}
            </span>
          </div>
          <div
            className={cn(
              "rounded-md px-3 py-2 text-sm",
              metrics.atRisk
                ? "bg-loss/10 text-loss"
                : "bg-profit/10 text-profit",
            )}
          >
            {metrics.atRisk
              ? "Account is close to or below its trailing threshold. Trade defensively."
              : "Account is healthy and well clear of its trailing threshold."}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  )
}
