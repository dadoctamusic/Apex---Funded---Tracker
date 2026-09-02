import type { Account, Trade } from "@/lib/types"

function escapeCell(value: string | number | undefined): string {
  const str = value === undefined || value === null ? "" : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function tradesToCsv(trades: Trade[], accounts: Account[]): string {
  const nameById = new Map(accounts.map((a) => [a.id, a.name]))
  const headers = [
    "Account",
    "Date",
    "Symbol",
    "Direction",
    "Contracts",
    "Entry Price",
    "Exit Price",
    "P&L",
    "Notes",
    "Screenshot URL",
  ]
  const rows = trades.map((t) =>
    [
      nameById.get(t.accountId) ?? t.accountId,
      t.date,
      t.symbol,
      t.direction,
      t.contracts,
      t.entryPrice,
      t.exitPrice,
      t.pnl,
      t.notes ?? "",
      t.screenshotUrl ?? "",
    ]
      .map(escapeCell)
      .join(","),
  )
  return [headers.join(","), ...rows].join("\n")
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
