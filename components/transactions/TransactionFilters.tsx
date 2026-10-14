'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { Input, Select, type SelectOption } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import type { NavigateOptions } from './useTransactionsParams'
import styles from './TransactionFilters.module.css'

export const SEARCH_DEBOUNCE_MS = 300

const toOptions = (all: string, labels: Record<string, string>): SelectOption[] => [
  { value: '', label: all },
  ...Object.entries(labels).map(([value, label]) => ({ value, label })),
]

const TYPE_OPTIONS = toOptions('All types', TRANSACTION_TYPE_LABELS)
const STATUS_OPTIONS = toOptions('All statuses', TRANSACTION_STATUS_LABELS)

export interface FilterPatch {
  q?: string | null
  type?: TransactionType | null
  status?: TransactionStatus | null
}

export interface TransactionFiltersProps {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  showClear: boolean
  onChange: (patch: FilterPatch, options?: NavigateOptions) => void
  onClear: () => void
}

export function TransactionFilters({
  q,
  type,
  status,
  showClear,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  const [search, setSearch] = useState(q)
  // The last search term we know the URL holds. When the URL's q differs from it, the change came
  // from outside (Back, Clear filters), so the box adopts it. Our own debounced updates set it first,
  // so a late URL update never overwrites what the user has typed since.
  const [syncedQ, setSyncedQ] = useState(q)
  if (q !== syncedQ) {
    setSyncedQ(q)
    setSearch(q)
  }

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const commitSearch = (value: string) => {
    clearTimeout(timer.current)
    const next = value.trim()
    if (next === syncedQ) return
    setSyncedQ(next)
    // Starting a search adds a history entry (Back returns to the unfiltered list); refining it
    // replaces that entry, so there's one entry per search rather than one per keystroke.
    onChange({ q: next }, { history: syncedQ ? 'replace' : 'push' })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => commitSearch(value), SEARCH_DEBOUNCE_MS)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    commitSearch(search)
  }

  const handleClear = () => {
    clearTimeout(timer.current)
    setSearch('')
    setSyncedQ('')
    onClear()
  }

  return (
    <form className={styles.filters} role="search" onSubmit={handleSubmit}>
      <Input
        label="Search"
        type="search"
        leadingIcon="search"
        placeholder="Search by reference, name or narration"
        autoComplete="off"
        maxLength={100}
        value={search}
        onChange={(event) => handleSearchChange(event.target.value)}
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={type ?? ''}
        onChange={(event) => onChange({ type: (event.target.value || null) as TransactionType | null })}
        fieldClassName={styles.select}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status ?? ''}
        onChange={(event) => onChange({ status: (event.target.value || null) as TransactionStatus | null })}
        fieldClassName={styles.select}
      />
      {showClear && (
        <button type="button" className={styles.clear} onClick={handleClear}>
          Clear filters
        </button>
      )}
    </form>
  )
}
