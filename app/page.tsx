import { TrackerProvider } from "@/components/tracker-provider"
import { Dashboard } from "@/components/dashboard"

export default function Page() {
  return (
    <TrackerProvider>
      <Dashboard />
    </TrackerProvider>
  )
}
