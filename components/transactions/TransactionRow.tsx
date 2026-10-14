import type { Transaction } from '@/types/api'
import { Money } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatDateTime, formatTime, isCredit, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { TransactionAvatar } from './TransactionAvatar'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transaction: Transaction
  onSelect?: (transaction: Transaction) => void
  /** Show the date as well as the time, for lists without day headings. */
  showDate?: boolean
}

export function TransactionRow({ transaction: tx, onSelect, showDate = false }: TransactionRowProps) {
  const credit = isCredit(tx.type)

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)} aria-haspopup="dialog">
      <span className={styles.avatar}>
        <TransactionAvatar transaction={tx} />
      </span>
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        {/* Upstream narration is unsanitised: always render it as text. */}
        <span className={styles.narration}>{tx.narration}</span>
      </span>
      <TransactionStatusBadge status={tx.status} className={styles.status} />
      <Money
        amount={tx.amount}
        currency={tx.currency}
        sign={credit ? 'credit' : 'debit'}
        className={cx(styles.amount, credit && styles.credit)}
      />
      <time className={styles.time} dateTime={tx.createdAt}>
        {showDate ? formatDateTime(tx.createdAt) : formatTime(tx.createdAt)}
      </time>
    </button>
  )
}
