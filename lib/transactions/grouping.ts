import type { Transaction } from '@/types/api'
import { formatDate } from '@/lib/format'

export interface DayGroup {
  /** Local calendar day, YYYY-MM-DD. */
  key: string
  /** "Today", "Yesterday" or e.g. "Mon, 5 Oct 2026". */
  label: string
  transactions: Transaction[]
}

/** Local calendar day as YYYY-MM-DD, so groups match the local times shown on each row. */
function localDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function dayLabel(key: string, iso: string, now: Date): string {
  if (key === localDayKey(now)) return 'Today'
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (key === localDayKey(yesterday)) return 'Yesterday'
  return formatDate(iso)
}

/** Group an already-sorted (newest first) list into consecutive days. */
export function groupByDay(transactions: Transaction[], now = new Date()): DayGroup[] {
  const groups: DayGroup[] = []
  for (const tx of transactions) {
    const key = localDayKey(new Date(tx.createdAt))
    const last = groups.at(-1)
    if (last?.key === key) last.transactions.push(tx)
    else groups.push({ key, label: dayLabel(key, tx.createdAt, now), transactions: [tx] })
  }
  return groups
}
