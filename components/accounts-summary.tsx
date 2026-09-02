"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { PnlValue } from "@/components/pnl-value"
import { useTracker } from "@/components/tracker-provider"
import {
  accountMetrics,
  formatCurrency,
  formatProfitFactor,
} from "@/lib/calculations"
import { ArrowRightIcon } from "lucide-react"

export function AccountsSummary({
  onSelectAccount,
}: {
  onSelectAccount: (accountId: string) => void
}) {
  const { accounts, trades } = useTracker()

  const rows = React.useMemo(
    () =>
      accounts.map((account) => ({
        account,
        metrics: accountMetrics(
          account,
          trades.filter((t) => t.accountId === account.id),
        ),
      })),
    [accounts, trades],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>
          Every funded and evaluation account at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Net P&amp;L</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Profit Factor</TableHead>
                <TableHead className="text-right">Buffer</TableHead>
                <TableHead className="text-right">Risk</TableHead>
                <TableHead className="sr-only">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ account, metrics }) => (
                <TableRow
                  key={account.id}
                  className="cursor-pointer"
                  onClick={() => onSelectAccount(account.id)}
                >
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={account.fundedStatus} />
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCurrency(metrics.currentBalance)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PnlValue value={metrics.netPnl} className="text-sm" />
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {metrics.winRate}%
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatProfitFactor(metrics.profitFactor)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PnlValue
                      value={metrics.distanceToThreshold}
                      showPlus={false}
                      className="text-sm"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {metrics.atRisk ? (
                      <Badge variant="destructive">At Risk</Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="border-transparent bg-profit/15 text-profit"
                      >
                        Healthy
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${account.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectAccount(account.id)
                      }}
                    >
                      <ArrowRightIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
