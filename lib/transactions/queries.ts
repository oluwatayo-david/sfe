import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PageMeta, Transaction } from '@/types/api'
import { getTransaction, getTransactions, type TransactionQuery } from '@/lib/api/endpoints'

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (query: TransactionQuery) => [...transactionKeys.all, 'list', query] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}

export interface TransactionPage {
  transactions: Transaction[]
  meta: PageMeta
}

export function useTransactions(query: TransactionQuery) {
  return useQuery({
    queryKey: transactionKeys.list(query),
    queryFn: async ({ signal }): Promise<TransactionPage> => {
      // The signal cancels the request when the query changes (e.g. the user keeps typing).
      const res = await getTransactions(query, { signal })
      const meta = res.meta ?? {
        page: query.page ?? 1,
        limit: query.limit ?? res.data.length,
        total: res.data.length,
        totalPages: 1,
      }
      return { transactions: res.data, meta }
    },
    // Keep showing the previous results while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

/** One transaction by id. `initial` (e.g. the row the user clicked) shows instantly while it loads. */
export function useTransaction(id: string | undefined, initial?: Transaction) {
  return useQuery({
    queryKey: transactionKeys.detail(id ?? ''),
    queryFn: async ({ signal }) => (await getTransaction(id!, { signal })).data,
    enabled: Boolean(id),
    placeholderData: initial,
  })
}
