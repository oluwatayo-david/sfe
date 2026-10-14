'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { Input, Select, type SelectOption } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import styles from './TransactionFilters.module.css'

export const SEARCH_DEBOUNCE_MS = 300

const toOptions = (all: string, labels: Record<string, string>): SelectOption[] => [
  { value: '', label: all },
  ...Object.entries(labels).map(([value, label]) => ({ value, label })),
]

const TYPE_OPTIONS = toOptions('All types', TRANSACTION_TYPE_LABELS)
const STATUS_OPTIONS = toOptions('All statuses', TRANSACTION_STATUS_LABELS)

export interface FilterPatch {
  type?: TransactionType | null
  status?: TransactionStatus | null
}

export interface TransactionFiltersProps {
  /** The search term in the URL. */
  q: string
  type?: TransactionType
  status?: TransactionStatus
  showClear: boolean
  /** Called with the trimmed term once typing pauses (or on Enter). */
  onSearch: (q: string) => void
  onChange: (patch: FilterPatch) => void
  onClear: () => void
}

export function TransactionFilters({
  q,
  type,
  status,
  showClear,
  onSearch,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  // The box is local state so typing stays instant; the URL is updated after a pause.
  const [text, setText] = useState(q)

  // Sync the box from the URL only when the URL's q actually changes, and only if that change isn't
  // our own search arriving (Back, a link or Clear filters elsewhere). Until the router applies a
  // search, renders still see the old q; comparing against the previous q (not the box) means they
  // never snap the box back or overwrite what the user has typed since.
  const [prevQ, setPrevQ] = useState(q)
  const [sentQ, setSentQ] = useState(q)
  if (q !== prevQ) {
    setPrevQ(q)
    if (q !== sentQ) {
      setSentQ(q)
      setText(q)
    }
  }

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const commit = (value: string) => {
    clearTimeout(timer.current)
    const next = value.trim()
    setSentQ(next)
    onSearch(next)
  }

  const handleTextChange = (value: string) => {
    setText(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => commit(value), SEARCH_DEBOUNCE_MS)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    commit(text)
  }

  const handleClear = () => {
    clearTimeout(timer.current)
    setText('')
    setSentQ('')
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
        value={text}
        onChange={(event) => handleTextChange(event.target.value)}
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
