"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OverviewWidgets } from "@/components/overview-widgets"
import { AccountsSummary } from "@/components/accounts-summary"
import { PerformanceCharts } from "@/components/performance-charts"
import { TradeJournal } from "@/components/trade-journal"
import { AccountDetail } from "@/components/account-detail"
import { TradeDialog } from "@/components/trade-dialog"
import { useTracker } from "@/components/tracker-provider"
import { toast } from "sonner"
import { PlusIcon, RotateCcwIcon, ActivityIcon } from "lucide-react"

export function Dashboard() {
  const { accounts, trades, hydrated, resetAll } = useTracker()
  const [tab, setTab] = React.useState("all")
  const [addOpen, setAddOpen] = React.useState(false)
  const [addAccountId, setAddAccountId] = React.useState<string | undefined>()
  const [resetOpen, setResetOpen] = React.useState(false)

  const combinedStart = React.useMemo(
    () => accounts.reduce((s, a) => s + a.startingBalance, 0),
    [accounts],
  )

  function openAdd(accountId?: string) {
    setAddAccountId(accountId)
    setAddOpen(true)
  }

  function handleReset() {
    resetAll()
    setTab("all")
    setResetOpen(false)
    toast.success("Data reset to sample portfolio.")
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ActivityIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-balance">
                Apex Funded Tracker Pro
              </h1>
              <p className="text-xs text-muted-foreground">
                Prop firm performance &amp; risk analytics
              </p>
            </div>
          </div>
<div className="flex items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => setResetOpen(true)}
  >
    <RotateCcwIcon data-icon="inline-start" />
    Reset
  </Button>

  <label>
<input
  id="csv-upload"
  type="file"
  accept=".csv"
  hidden
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const csvText = event.target?.result as string

      console.log(csvText)
      alert(`Loaded ${file.name}`)
    }

    reader.readAsText(file)
  }}
/>

<Button
  size="sm"
  variant="outline"
  onClick={() => {
    document.getElementById("csv-upload")?.click()
  }}
>
  Import CSV
</Button>
  </label>

  <Button size="sm" onClick={() => openAdd()}>
    <PlusIcon data-icon="inline-start" />
    Add Trade
  </Button>
</div>
          </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
        {!hydrated ? (
          <DashboardSkeleton />
        ) : (
          <>
            <OverviewWidgets />

            <Tabs value={tab} onValueChange={setTab} className="gap-4">
              <TabsList className="flex-wrap">
                <TabsTrigger value="all">All Accounts</TabsTrigger>
                {accounts.map((a) => (
                  <TabsTrigger key={a.id} value={a.id}>
                    {a.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="flex flex-col gap-6">
                <AccountsSummary onSelectAccount={setTab} />
                <PerformanceCharts
                  trades={trades}
                  startingBalance={combinedStart}
                />
                <TradeJournal onAddTrade={() => openAdd()} />
              </TabsContent>

              {accounts.map((a) => (
                <TabsContent
                  key={a.id}
                  value={a.id}
                  className="flex flex-col gap-6"
                >
                  <AccountDetail account={a} />
                  <PerformanceCharts
                    trades={trades.filter((t) => t.accountId === a.id)}
                    startingBalance={a.startingBalance}
                  />
                  <TradeJournal
                    accountId={a.id}
                    onAddTrade={() => openAdd(a.id)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </main>

      <TradeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultAccountId={addAccountId}
      />

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset all data?</DialogTitle>
            <DialogDescription>
              This clears your locally saved accounts and trades and restores the
              original sample portfolio. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive" onClick={handleReset}>
              Reset data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-10 w-72 rounded-md" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
