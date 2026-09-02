function d(month: number, day: number): string {
  return `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export const DEFAULT_TRADES: Trade[] = []

function isBrowser(): boolean {
  return typeof window !== "undefined"
}
