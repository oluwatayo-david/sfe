import { useMemo } from 'react'
import type { Transaction } from '@/types/api'
import { Card, Skeleton } from '@/components/ui'
import { cx } from '@/lib/cx'
import { groupByDay } from '@/lib/transactions/grouping'
import { TransactionRow } from './TransactionRow'
import styles from './TransactionList.module.css'

export interface TransactionListProps {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
  /** Newer results are loading; the current ones stay visible but dimmed. */
  busy?: boolean
}

export function TransactionList({ transactions, onSelect, busy = false }: TransactionListProps) {
  const groups = useMemo(() => groupByDay(transactions), [transactions])

  return (
    <div className={cx(styles.list, busy && styles.busy)} aria-busy={busy}>
      <Card padding="none">
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`day-${group.key}`}>
            <h2 id={`day-${group.key}`} className={styles.day}>
              {group.label}
            </h2>
            <ul className={styles.rows}>
              {group.transactions.map((tx) => (
                <li key={tx.id}>
                  <TransactionRow transaction={tx} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Card>
    </div>
  )
}

const SKELETON_ROWS = 6

/** First-load placeholder with the same shape as the list. */
export function TransactionListSkeleton() {
  return (
    <div className={styles.list} aria-busy>
      <span className="visually-hidden" role="status">
        Loading transactions
      </span>
      <Card padding="none">
        <div className={styles.day}>
          <Skeleton width={64} height={10} />
        </div>
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <Skeleton circle width={40} />
            <div className={styles.skeletonMain}>
              <Skeleton width="40%" height={12} />
              <Skeleton width="70%" height={10} />
            </div>
            <div className={styles.skeletonEnd}>
              <Skeleton width={96} height={12} />
              <Skeleton width={40} height={10} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
