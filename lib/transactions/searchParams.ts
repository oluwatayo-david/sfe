import type { TransactionStatus, TransactionType } from '@/types/api'
import type { TransactionQuery } from '@/lib/api/endpoints'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

/**
 * The Transactions page keeps all of its state in the URL so refresh, shared links and Back restore
 * the user's place: ?q=&type=&status=&page=&tx=
 */
export interface TransactionsParams {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  page: number
  /** Id of the transaction open in the details drawer. */
  tx?: string
}

export const PAGE_SIZE = 20

const isType = (value: string | null): value is TransactionType =>
  value !== null && Object.hasOwn(TRANSACTION_TYPE_LABELS, value)

const isStatus = (value: string | null): value is TransactionStatus =>
  value !== null && Object.hasOwn(TRANSACTION_STATUS_LABELS, value)

/** Read params from the URL. Anything invalid falls back to its default instead of reaching the API. */
export function parseParams(search: URLSearchParams): TransactionsParams {
  const type = search.get('type')
  const status = search.get('status')
  const page = Number(search.get('page'))
  const tx = search.get('tx')?.trim()

  return {
    q: search.get('q')?.trim() ?? '',
    type: isType(type) ? type : undefined,
    status: isStatus(status) ? status : undefined,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    tx: tx || undefined,
  }
}

export const hasFilters = (params: TransactionsParams) => Boolean(params.q || params.type || params.status)

/** The list request for the current params. `tx` doesn't affect the list. */
export function toListQuery(params: TransactionsParams): TransactionQuery {
  return {
    page: params.page,
    limit: PAGE_SIZE,
    q: params.q || undefined,
    type: params.type,
    status: params.status,
  }
}

type Patch = Partial<{ [K in keyof TransactionsParams]: TransactionsParams[K] | null }>

const FILTER_KEYS = ['q', 'type', 'status'] as const

/**
 * Apply a patch to the current URL params and return the new query string (with leading "?", or "").
 * Changing any filter returns to page 1. Keys the page doesn't own (e.g. __scenario) are kept.
 */
export function updateSearch(current: URLSearchParams, patch: Patch): string {
  const next = new URLSearchParams(current)

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null || value === '') next.delete(key)
    else next.set(key, String(value))
  }

  const filtersChanged = FILTER_KEYS.some((key) => key in patch && current.get(key) !== next.get(key))
  if (filtersChanged && !('page' in patch)) next.delete('page')
  if (next.get('page') === '1') next.delete('page')

  const qs = next.toString()
  return qs ? `?${qs}` : ''
}
