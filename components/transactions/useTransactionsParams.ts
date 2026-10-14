'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { parseParams, updateSearch, type TransactionsParams } from '@/lib/transactions/searchParams'

type Patch = Parameters<typeof updateSearch>[1]

export interface NavigateOptions {
  /** 'push' adds a history entry (Back undoes it); 'replace' doesn't (e.g. each search keystroke). */
  history?: 'push' | 'replace'
  scroll?: boolean
}

/** Transactions page state, read from and written to the URL. */
export function useTransactionsParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const params: TransactionsParams = useMemo(() => parseParams(searchParams), [searchParams])

  // Debounced callers (search) may run after the URL has moved on; always patch the latest URL.
  const latestSearch = useRef(searchParams)
  useEffect(() => {
    latestSearch.current = searchParams
  }, [searchParams])

  const setParams = useCallback(
    (patch: Patch, { history = 'push', scroll = false }: NavigateOptions = {}) => {
      const search = updateSearch(new URLSearchParams(latestSearch.current.toString()), patch)
      router[history](`${pathname}${search}`, { scroll })
    },
    [router, pathname]
  )

  /**
   * Commit a search term. Starting a search adds a history entry (Back returns to the unfiltered
   * list); refining it replaces that entry, so there's one entry per search, not per keystroke.
   * Decided from the latest URL, so a debounced call that fires late still chooses correctly.
   */
  const setSearch = useCallback(
    (q: string) => {
      const current = latestSearch.current.get('q') ?? ''
      if (q === current) return
      setParams({ q }, { history: current ? 'replace' : 'push' })
    },
    [setParams]
  )

  // For links (pagination): derived from the current render so hrefs are correct on first paint.
  const linkFor = useCallback(
    (patch: Patch) => `${pathname}${updateSearch(new URLSearchParams(searchParams.toString()), patch)}`,
    [pathname, searchParams]
  )

  return { params, setParams, setSearch, linkFor }
}
