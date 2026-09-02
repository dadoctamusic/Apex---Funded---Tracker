"use client"

import * as React from "react"
import {
  Dialog,
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PnlValue } from "@/components/pnl-value"
import { useTracker } from "@/components/tracker-provider"
import { computeTradePnl } from "@/lib/calculations"
import type { Trade, TradeDirection } from "@/lib/types"
import { toast } from "sonner"

const SYMBOLS = ["ES", "NQ", "MNQ", "MES", "CL", "GC", "YM", "RTY"]

interface TradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trade?: Trade | null
  defaultAccountId?: string
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TradeDialog({
  open,
  onOpenChange,
  trade,
  defaultAccountId,
}: TradeDialogProps) {
  const { accounts, addTrade, updateTrade } = useTracker()
  const isEdit = Boolean(trade)

  const [accountId, setAccountId] = React.useState("")
  const [date, setDate] = React.useState(todayIso())
  const [symbol, setSymbol] = React.useState("ES")
  const [direction, setDirection] = React.useState<TradeDirection>("Long")
  const [contracts, setContracts] = React.useState("1")
  const [entryPrice, setEntryPrice] = React.useState("")
  const [exitPrice, setExitPrice] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [screenshotUrl, setScreenshotUrl] = React.useState("")

  // Reset the form whenever the dialog opens or the target trade changes.
  React.useEffect(() => {
    if (!open) return
    if (trade) {
      setAccountId(trade.accountId)
      setDate(trade.date)
      setSymbol(trade.symbol)
      setDirection(trade.direction)
      setContracts(String(trade.contracts))
      setEntryPrice(String(trade.entryPrice))
      setExitPrice(String(trade.exitPrice))
      setNotes(trade.notes ?? "")
      setScreenshotUrl(trade.screenshotUrl ?? "")
    } else {
      setAccountId(defaultAccountId ?? accounts[0]?.id ?? "")
      setDate(todayIso())
      setSymbol("ES")
      setDirection("Long")
      setContracts("1")
      setEntryPrice("")
      setExitPrice("")
      setNotes("")
      setScreenshotUrl("")
    }
  }, [open, trade, defaultAccountId, accounts])

  const contractsNum = Number(contracts)
  const entryNum = Number(entryPrice)
  const exitNum = Number(exitPrice)
  const canCompute =
    contractsNum > 0 &&
    entryPrice.trim() !== "" &&
    exitPrice.trim() !== "" &&
    !Number.isNaN(entryNum) &&
    !Number.isNaN(exitNum)
  const livePnl = canCompute
    ? computeTradePnl(direction, contractsNum, entryNum, exitNum)
    : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accountId) {
      toast.error("Select an account.")
      return
    }
    if (!canCompute) {
      toast.error("Enter valid contracts, entry, and exit prices.")
      return
    }
    if (!Number.isInteger(contractsNum) || contractsNum <= 0) {
      toast.error("Contracts must be a positive whole number.")
      return
    }

    const payload = {
      accountId,
      date,
      symbol,
      direction,
      contracts: contractsNum,
      entryPrice: entryNum,
      exitPrice: exitNum,
      pnl: livePnl,
      notes: notes.trim() || undefined,
      screenshotUrl: screenshotUrl.trim() || undefined,
    }

    if (isEdit && trade) {
      updateTrade(trade.id, payload)
      toast.success("Trade updated.")
    } else {
      addTrade(payload)
      toast.success("Trade logged.")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Trade" : "Log New Trade"}</DialogTitle>
          <DialogDescription>
            Record a fill. P&amp;L is calculated automatically from your entry and
            exit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="trade-account">Account</FieldLabel>
                <Select
                  value={accountId}
                  onValueChange={(v) => setAccountId(v as string)}
                  items={accounts.map((a) => ({ label: a.name, value: a.id }))}
                >
                  <SelectTrigger id="trade-account">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="trade-date">Date</FieldLabel>
                <Input
                  id="trade-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="trade-symbol">Symbol</FieldLabel>
                <Select
                  value={symbol}
                  onValueChange={(v) => setSymbol(v as string)}
                  items={SYMBOLS.map((s) => ({ label: s, value: s }))}
                >
                  <SelectTrigger id="trade-symbol">
                    <SelectValue placeholder="Symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYMBOLS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="trade-direction">Direction</FieldLabel>
                <Select
                  value={direction}
                  onValueChange={(v) => setDirection(v as TradeDirection)}
                  items={[
                    { label: "Long", value: "Long" },
                    { label: "Short", value: "Short" },
                  ]}
                >
                  <SelectTrigger id="trade-direction">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Long">Long</SelectItem>
                    <SelectItem value="Short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="trade-contracts">Contracts</FieldLabel>
                <Input
                  id="trade-contracts"
                  type="number"
                  min={1}
                  step={1}
                  value={contracts}
                  onChange={(e) => setContracts(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="trade-entry">Entry Price</FieldLabel>
                <Input
                  id="trade-entry"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="trade-exit">Exit Price</FieldLabel>
                <Input
                  id="trade-exit"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Calculated P&amp;L</FieldLabel>
                <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3">
                  {canCompute ? (
                    <PnlValue value={livePnl} className="text-sm font-semibold" />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="trade-notes">Notes</FieldLabel>
              <Textarea
                id="trade-notes"
                rows={2}
                placeholder="Setup, execution, mistakes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="trade-screenshot">Screenshot URL</FieldLabel>
              <Input
                id="trade-screenshot"
                type="url"
                placeholder="https://…"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Log Trade"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
