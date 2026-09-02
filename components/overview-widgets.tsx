"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PnlValue } from "@/components/pnl-value"
import { useTracker } from "@/components/tracker-provider"
import { accountMetrics, formatCurrency } from "@/lib/calculations"
import { cn } from "@/lib/utils"
import {
  TrendingUpIcon,
  WalletIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  GaugeIcon,
} from "lucide-react"

export function OverviewWidgets() {
  const { accounts, trades } = useTracker()

  const rows = React.useMemo(
    () =>
      accounts.map((account) => {
        const accountTrades = trades.filter((t) => t.accountId === account.id)
        return { account, metrics: accountMetrics(account, accountTrades) }
      }),
    [accounts, trades],
  )

  const totalNetPnl = rows.reduce((s, r) => s + r.metrics.netPnl, 0)
  const combinedBalance = rows.reduce((s, r) => s + r.metrics.currentBalance, 0)
  const startingTotal = accounts.reduce((s, a) => s + a.startingBalance, 0)
  const atRisk = rows.filter((r) => r.metrics.atRisk)
  const riskLevel =
    atRisk.length === 0 ? "Healthy" : atRisk.length === 1 ? "Caution" : "At Risk"

  const returnPct =
    startingTotal > 0 ? (totalNetPnl / startingTotal) * 100 : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUpIcon className="size-4" />}
          label="Total Net P&L"
          description={`${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}% on capital`}
        >
          <PnlValue value={totalNetPnl} className="text-2xl font-semibold" />
        </StatCard>

        <StatCard
          icon={<WalletIcon className="size-4" />}
          label="Combined Balance"
          description={`Across ${accounts.length} accounts`}
        >
          <span className="font-mono text-2xl font-semibold tabular-nums">
            {formatCurrency(combinedBalance)}
          </span>
        </StatCard>

        <StatCard
          icon={
            riskLevel === "Healthy" ? (
              <ShieldCheckIcon className="size-4" />
            ) : (
              <ShieldAlertIcon className="size-4" />
            )
          }
          label="Risk Status"
          description="Trailing drawdown health"
          accent={
            riskLevel === "Healthy"
              ? "profit"
              : riskLevel === "Caution"
                ? "warn"
                : "loss"
          }
        >
          <span
            className={cn(
              "text-2xl font-semibold",
              riskLevel === "Healthy" && "text-profit",
              riskLevel === "Caution" && "text-chart-3",
              riskLevel === "At Risk" && "text-loss",
            )}
          >
            {riskLevel}
          </span>
        </StatCard>

        <StatCard
          icon={<ShieldAlertIcon className="size-4" />}
          label="Accounts at Risk"
          description={
            atRisk.length > 0
              ? atRisk.map((r) => r.account.name).join(", ")
              : "All accounts within limits"
          }
        >
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums",
              atRisk.length > 0 ? "text-loss" : "text-profit",
            )}
          >
            {atRisk.length}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {accounts.length}
            </span>
          </span>
        </StatCard>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GaugeIcon className="size-4 text-primary" />
            <CardTitle>Trailing Threshold Monitor</CardTitle>
          </div>
          <CardDescription>
            Live distance between each account&apos;s balance and its trailing
            drawdown threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {rows.map(({ account, metrics }) => {
            const buffer = account.startingBalance - account.trailingThreshold
            const used = buffer > 0 ? metrics.currentBalance - account.trailingThreshold : 0
            const pct = buffer > 0 ? Math.max(0, Math.min(100, (used / buffer) * 100)) : 0
            return (
              <div key={account.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{account.name}</span>
                    {metrics.atRisk && (
                      <Badge variant="destructive" className="text-[10px]">
                        At Risk
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      Threshold:{" "}
                      <span className="font-mono text-foreground">
                        {formatCurrency(account.trailingThreshold)}
                      </span>
                    </span>
                    <span>
                      Buffer:{" "}
                      <PnlValue
                        value={metrics.distanceToThreshold}
                        showPlus={false}
                        className="text-xs"
                      />
                    </span>
                  </div>
                </div>
                <Progress
                  value={pct}
                  className={cn(
                    metrics.atRisk
                      ? "[&_[data-slot=progress-indicator]]:bg-loss"
                      : pct < 50
                        ? "[&_[data-slot=progress-indicator]]:bg-chart-3"
                        : "[&_[data-slot=progress-indicator]]:bg-profit",
                  )}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  description,
  children,
  accent,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  children: React.ReactNode
  accent?: "profit" | "loss" | "warn"
}) {
  return (
    <Card className="gap-0 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            {label}
          </CardDescription>
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground",
              accent === "profit" && "bg-profit/15 text-profit",
              accent === "loss" && "bg-loss/15 text-loss",
              accent === "warn" && "bg-chart-3/15 text-chart-3",
            )}
          >
            {icon}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {children}
        {description && (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
