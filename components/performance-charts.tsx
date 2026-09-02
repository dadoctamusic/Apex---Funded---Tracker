"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  dailyPnl,
  equityCurve,
  formatCompactCurrency,
  monthlyPnl,
} from "@/lib/calculations"
import type { Trade } from "@/lib/types"
import { LineChartIcon } from "lucide-react"

const PROFIT = "var(--profit)"
const LOSS = "var(--loss)"

function formatDay(value: string): string {
  const [, m, d] = value.split("-")
  return m && d ? `${Number(m)}/${Number(d)}` : value
}

function formatMonth(value: string): string {
  const [y, m] = value.split("-")
  const date = new Date(Number(y), Number(m) - 1, 1)
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

const equityConfig = {
  equity: { label: "Equity", color: "var(--chart-1)" },
} satisfies ChartConfig

const pnlConfig = {
  pnl: { label: "P&L" },
} satisfies ChartConfig

function ChartEmpty() {
  return (
    <Empty className="h-[240px] justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LineChartIcon />
        </EmptyMedia>
        <EmptyTitle>No trades yet</EmptyTitle>
        <EmptyDescription>
          Log a trade to populate performance charts.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function PerformanceCharts({
  trades,
  startingBalance,
}: {
  trades: Trade[]
  startingBalance: number
}) {
  const equityData = React.useMemo(
    () => equityCurve(startingBalance, trades),
    [startingBalance, trades],
  )
  const dailyData = React.useMemo(() => dailyPnl(trades), [trades])
  const monthlyData = React.useMemo(() => monthlyPnl(trades), [trades])

  const hasTrades = trades.length > 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>
            Cumulative account balance from {formatCompactCurrency(startingBalance)}{" "}
            starting capital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasTrades ? (
            <ChartContainer config={equityConfig} className="h-[280px] w-full">
              <AreaChart data={equityData} margin={{ left: 4, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={(v) => (v === "Start" ? "Start" : formatDay(v))}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(v) => formatCompactCurrency(Number(v))}
                  domain={["auto", "auto"]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => (v === "Start" ? "Start" : formatDay(String(v)))}
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatCompactCurrency(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="equity"
                  type="monotone"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#equityFill)"
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <ChartEmpty />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily P&L</CardTitle>
          <CardDescription>Net profit and loss per trading day.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTrades ? (
            <ChartContainer config={pnlConfig} className="h-[240px] w-full">
              <BarChart data={dailyData} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={16}
                  tickFormatter={formatDay}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => formatCompactCurrency(Number(v))}
                />
                <ReferenceLine y={0} stroke="var(--border)" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => formatDay(String(v))}
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatCompactCurrency(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {dailyData.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={entry.pnl >= 0 ? PROFIT : LOSS}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartEmpty />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly P&L</CardTitle>
          <CardDescription>Aggregated performance by month.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTrades ? (
            <ChartContainer config={pnlConfig} className="h-[240px] w-full">
              <BarChart data={monthlyData} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatMonth}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => formatCompactCurrency(Number(v))}
                />
                <ReferenceLine y={0} stroke="var(--border)" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => formatMonth(String(v))}
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatCompactCurrency(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {monthlyData.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.pnl >= 0 ? PROFIT : LOSS}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartEmpty />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
