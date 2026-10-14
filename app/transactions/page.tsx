import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionListSkeleton, TransactionsView } from '@/components/transactions'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  // TransactionsView reads the URL with useSearchParams, which needs a Suspense boundary for the
  // route to prerender (next build fails without one).
  return (
    <Suspense
      fallback={
        <div className={styles.fallback}>
          <h1 className={styles.title}>Transactions</h1>
          <TransactionListSkeleton />
        </div>
      }
    >
      <TransactionsView />
    </Suspense>
  )
}
