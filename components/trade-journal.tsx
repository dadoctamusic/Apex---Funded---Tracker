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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PnlValue } from "@/components/pnl-value"
import { TradeDialog } from "@/components/trade-dialog"
import { useTracker } from "@/components/tracker-provider"
import { tradesToCsv, downloadCsv } from "@/lib/csv"
import { cn } from "@/lib/utils"
import type { Trade } from "@/lib/types"
import { toast } from "sonner"
import {
  SearchIcon,
  DownloadIcon,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
  NotebookPenIcon,
} from "lucide-react"

const DIRECTIONS = ["All", "Long", "Short"] as const

export function TradeJournal({
  accountId,
  onAddTrade,
}: {
  accountId?: string
  onAddTrade: () => void
}) {
  const { accounts, trades, deleteTrade } = useTracker()
  const [query, setQuery] = React.useState("")
  const [direction, setDirection] = React.useState<(typeof DIRECTIONS)[number]>("All")
  const [symbol, setSymbol] = React.useState("All")

  const [editing, setEditing] = React.useState<Trade | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Trade | null>(null)
  const [screenshot, setScreenshot] = React.useState<Trade | null>(null)

  const nameById = React.useMemo(
    () => new Map(accounts.map((a) => [a.id, a.name])),
    [accounts],
  )

  const scoped = React.useMemo(
    () => (accountId ? trades.filter((t) => t.accountId === accountId) : trades),
    [trades, accountId],
  )

  const symbols = React.useMemo(
    () => ["All", ...Array.from(new Set(scoped.map((t) => t.symbol))).sort()],
    [scoped],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped
      .filter((t) => direction === "All" || t.direction === direction)
      .filter((t) => symbol === "All" || t.symbol === symbol)
      .filter((t) => {
        if (!q) return true
        return (
          t.symbol.toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q) ||
          (nameById.get(t.accountId) ?? "").toLowerCase().includes(q)
        )
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [scoped, direction, symbol, query, nameById])

  function handleEdit(trade: Trade) {
    setEditing(trade)
    setEditOpen(true)
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("No trades to export.")
      return
    }
    const csv = tradesToCsv(filtered, accounts)
    downloadCsv(`apex-trades-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    toast.success(`Exported ${filtered.length} trades.`)
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteTrade(deleteTarget.id)
      toast.success("Trade deleted.")
      setDeleteTarget(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Trade Journal</CardTitle>
            <CardDescription>
              {filtered.length} {filtered.length === 1 ? "trade" : "trades"}
              {accountId ? " on this account" : " across all accounts"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon data-icon="inline-start" />
              Export CSV
            </Button>
            <Button size="sm" onClick={onAddTrade}>
              <NotebookPenIcon data-icon="inline-start" />
              Add Trade
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbol, notes, account…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={direction}
              onValueChange={(v) => setDirection(v as (typeof DIRECTIONS)[number])}
              items={DIRECTIONS.map((d) => ({ label: d, value: d }))}
            >
              <SelectTrigger className="w-32" aria-label="Filter by direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "All" ? "All sides" : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={symbol}
              onValueChange={(v) => setSymbol(v as string)}
              items={symbols.map((s) => ({ label: s, value: s }))}
            >
              <SelectTrigger className="w-32" aria-label="Filter by symbol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "All" ? "All symbols" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NotebookPenIcon />
              </EmptyMedia>
              <EmptyTitle>No trades found</EmptyTitle>
              <EmptyDescription>
                {scoped.length === 0
                  ? "Log your first trade to start building your journal."
                  : "No trades match the current filters."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {!accountId && <TableHead>Account</TableHead>}
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Exit</TableHead>
                  <TableHead className="text-right">P&amp;L</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {t.date}
                    </TableCell>
                    {!accountId && (
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {nameById.get(t.accountId) ?? "—"}
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{t.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "border-transparent",
                          t.direction === "Long"
                            ? "bg-profit/15 text-profit"
                            : "bg-loss/15 text-loss",
                        )}
                      >
                        {t.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {t.contracts}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {t.entryPrice}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {t.exitPrice}
                    </TableCell>
                    <TableCell className="text-right">
                      <PnlValue value={t.pnl} className="text-sm" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {t.screenshotUrl ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="View screenshot"
                            onClick={() => setScreenshot(t)}
                          >
                            <ImageIcon />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit trade"
                          onClick={() => handleEdit(t)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete trade"
                          className="text-muted-foreground hover:text-loss"
                          onClick={() => setDeleteTarget(t)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <TradeDialog open={editOpen} onOpenChange={setEditOpen} trade={editing} />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete trade?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently remove the ${deleteTarget.symbol} ${deleteTarget.direction.toLowerCase()} from ${deleteTarget.date}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline">Cancel</Button>
              }
            />
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(screenshot)}
        onOpenChange={(o) => !o && setScreenshot(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {screenshot
                ? `${screenshot.symbol} · ${screenshot.date}`
                : "Screenshot"}
            </DialogTitle>
            <DialogDescription>Trade screenshot</DialogDescription>
          </DialogHeader>
          {screenshot?.screenshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshot.screenshotUrl || "/placeholder.svg"}
              alt={`${screenshot.symbol} trade chart`}
              className="w-full rounded-md border border-border"
              crossOrigin="anonymous"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
