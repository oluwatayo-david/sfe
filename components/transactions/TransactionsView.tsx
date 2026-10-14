'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { PageMeta, Transaction } from '@/types/api'
import { Button, Card, Drawer, Pagination, Skeleton, StateMessage } from '@/components/ui'
import { hasFilters, toListQuery } from '@/lib/transactions/searchParams'
import { useTransactions } from '@/lib/transactions/queries'
import { TransactionDetails } from './TransactionDetails'
import { TransactionFilters } from './TransactionFilters'
import { TransactionList, TransactionListSkeleton } from './TransactionList'
import { useTransactionsParams } from './useTransactionsParams'
import styles from './TransactionsView.module.css'

const formatCount = (count: number) => count.toLocaleString('en-GB')

const plural = (count: number, one: string, many: string) =>
  `${formatCount(count)} ${count === 1 ? one : many}`

/** "Showing 1–20 of 237" */
function rangeLabel({ page, limit, total }: PageMeta, shown: number) {
  const first = (page - 1) * limit + 1
  return `Showing ${formatCount(first)}–${formatCount(first + shown - 1)} of ${formatCount(total)}`
}

/** The Transactions page. All state lives in the URL; the header and filters stay put in every state. */
export function TransactionsView() {
  const router = useRouter()
  const { params, setParams, setSearch, linkFor } = useTransactionsParams()
  const listQuery = useMemo(() => toListQuery(params), [params])
  const { data, isPending, isError, isPlaceholderData, refetch } = useTransactions(listQuery)
  const filtered = hasFilters(params)

  // Opening details from a row pushes a history entry, so closing goes Back to it. A drawer that
  // arrived via a shared link has nothing to go back to, so closing just drops ?tx.
  const [openedFromList, setOpenedFromList] = useState(false)

  const openDetails = (tx: Transaction) => {
    setOpenedFromList(true)
    setParams({ tx: tx.id })
  }

  const closeDetails = () => {
    if (openedFromList) router.back()
    else setParams({ tx: null }, { history: 'replace' })
    setOpenedFromList(false)
  }

  const clearFilters = () => setParams({ q: null, type: null, status: null })

  // A stale link can point past the last page (e.g. ?page=40); go to the last page that exists.
  const totalPages = data?.meta.totalPages
  useEffect(() => {
    if (!isPlaceholderData && totalPages && params.page > totalPages) {
      setParams({ page: totalPages }, { history: 'replace' })
    }
  }, [isPlaceholderData, totalPages, params.page, setParams])

  const selected = data?.transactions.find((tx) => tx.id === params.tx)

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle} aria-live="polite">
          {data ? (
            filtered ? (
              plural(data.meta.total, 'result', 'results')
            ) : (
              plural(data.meta.total, 'transaction', 'transactions')
            )
          ) : isPending ? (
            <Skeleton width={120} height={14} />
          ) : null}
        </p>
      </header>

      <TransactionFilters
        q={params.q}
        type={params.type}
        status={params.status}
        showClear={filtered}
        onSearch={setSearch}
        onChange={setParams}
        onClear={clearFilters}
      />

      {isPending ? (
        <TransactionListSkeleton />
      ) : isError ? (
        <Card padding="none">
          <StateMessage
            icon="alert"
            tone="danger"
            role="alert"
            title="We couldn’t load your transactions"
            description="Check your connection and try again."
            action={
              <Button iconLeft="refresh" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : data.transactions.length === 0 ? (
        <Card padding="none">
          {filtered ? (
            <StateMessage
              icon="search"
              title="No transactions match your filters"
              description="Try a different search term or remove some filters."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <StateMessage
              icon="inbox"
              title="No transactions yet"
              description="When you add money, send a transfer or pay with your card, it will show up here."
            />
          )}
        </Card>
      ) : (
        <>
          <TransactionList transactions={data.transactions} onSelect={openDetails} busy={isPlaceholderData} />
          <footer className={styles.footer}>
            <p className={styles.range}>{rangeLabel(data.meta, data.transactions.length)}</p>
            {data.meta.totalPages > 1 && (
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                getHref={(page) => linkFor({ page })}
              />
            )}
          </footer>
        </>
      )}

      <Drawer open={Boolean(params.tx)} title="Transaction details" onClose={closeDetails}>
        {params.tx && <TransactionDetails id={params.tx} initial={selected} onClose={closeDetails} />}
      </Drawer>
    </div>
  )
}
