'use client'
import { useEffect, useRef, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Icon, Money, Skeleton, StateMessage } from '@/components/ui'
import { ApiError } from '@/lib/api/client'
import { cx } from '@/lib/cx'
import { formatDateTime, getTransactionTitle, isCredit, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { useTransaction } from '@/lib/transactions/queries'
import { TransactionAvatar } from './TransactionAvatar'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import styles from './TransactionDetails.module.css'

export interface TransactionDetailsProps {
  id: string
  /** The row the user clicked, shown immediately while the full record loads. */
  initial?: Transaction
  onClose: () => void
}

/** Drawer body for one transaction: loads it by id so shared links work for any transaction. */
export function TransactionDetails({ id, initial, onClose }: TransactionDetailsProps) {
  const { data, error, isError, refetch } = useTransaction(id, initial)

  if (error instanceof ApiError && error.status === 404) {
    return (
      <StateMessage
        icon="search"
        title="Transaction not found"
        description="It may have been removed, or the link is wrong."
        action={
          <Button variant="secondary" onClick={onClose}>
            Back to transactions
          </Button>
        }
      />
    )
  }

  // If a refresh fails but we already have the row, keep showing it rather than an error.
  const transaction = data ?? initial
  if (transaction) return <DetailsContent transaction={transaction} />

  if (isError) {
    return (
      <StateMessage
        icon="alert"
        tone="danger"
        role="alert"
        title="We couldn’t load this transaction"
        description="Check your connection and try again."
        action={
          <Button iconLeft="refresh" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    )
  }

  return <DetailsSkeleton />
}

function DetailsContent({ transaction: tx }: { transaction: Transaction }) {
  const credit = isCredit(tx.type)

  return (
    <div className={styles.details}>
      <div className={styles.summary}>
        <TransactionAvatar transaction={tx} size="lg" />
        <p className={styles.headline}>{getTransactionTitle(tx)}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={styles.amount}
        />
        <TransactionStatusBadge status={tx.status} />
      </div>

      <section aria-labelledby="details-heading">
        <h3 id="details-heading" className={styles.sectionTitle}>
          Details
        </h3>
        <dl className={styles.list}>
          <div className={styles.item}>
            <dt>Reference</dt>
            <dd className={styles.reference}>
              <span className={styles.mono}>{tx.reference}</span>
              <CopyButton value={tx.reference} label="reference" />
            </dd>
          </div>
          <div className={styles.item}>
            <dt>Date</dt>
            <dd>
              <time dateTime={tx.createdAt}>{formatDateTime(tx.createdAt)}</time>
            </dd>
          </div>
          <div className={styles.item}>
            <dt>Type</dt>
            <dd>{TRANSACTION_TYPE_LABELS[tx.type]}</dd>
          </div>
          {tx.counterparty && (
            <div className={styles.item}>
              <dt>Counterparty</dt>
              <dd>{tx.counterparty}</dd>
            </div>
          )}
          <div className={styles.item}>
            <dt>Narration</dt>
            {/* Upstream narration is unsanitised: always render it as text. */}
            <dd>{tx.narration}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="summary-heading">
        <h3 id="summary-heading" className={styles.sectionTitle}>
          Summary
        </h3>
        <dl className={styles.list}>
          <div className={styles.item}>
            <dt>Amount</dt>
            <dd>
              <Money amount={tx.amount} currency={tx.currency} />
            </dd>
          </div>
          <div className={styles.item}>
            <dt>Fee</dt>
            <dd>
              <Money amount={tx.fee} currency={tx.currency} />
            </dd>
          </div>
          {/* API.md: the fee is charged on top of the amount, in the same currency. */}
          <div className={cx(styles.item, styles.total)}>
            <dt>Total</dt>
            <dd>
              <Money amount={tx.amount + tx.fee} currency={tx.currency} />
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

const COPIED_RESET_MS = 2000

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
    } catch {
      // Clipboard unavailable (permissions or insecure context): the value is still selectable.
    }
  }

  return (
    <>
      <button type="button" className={styles.copy} onClick={copy} aria-label={`Copy ${label}`}>
        <Icon name="copy" size={16} />
      </button>
      <span className={styles.copied} role="status">
        {copied ? 'Copied' : ''}
      </span>
    </>
  )
}

function DetailsSkeleton() {
  return (
    <div className={styles.details} aria-busy>
      <span className="visually-hidden" role="status">
        Loading transaction
      </span>
      <div className={styles.summary}>
        <Skeleton circle width={48} />
        <Skeleton width={160} height={12} />
        <Skeleton width={200} height={24} />
        <Skeleton width={88} height={20} />
      </div>
      <div className={styles.list}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.item}>
            <Skeleton width={90} height={12} />
            <Skeleton width={140} height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}
