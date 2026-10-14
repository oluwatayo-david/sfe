import type { Transaction, TransactionStatus, TransactionType } from '@/types/api'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  conversion: 'Conversion',
  card_payment: 'Card payment',
  bill_payment: 'Bill payment',
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  successful: 'Successful',
  pending: 'Pending',
  failed: 'Failed',
}

const CREDIT_TYPES: ReadonlySet<TransactionType> = new Set(['deposit', 'transfer_in', 'conversion'])

/** Money coming into the wallet. A conversion row is recorded in the currency received. */
export const isCredit = (type: TransactionType) => CREDIT_TYPES.has(type)

/** Up to two initials from a name: "Ada Okafor" -> "AO", "Okonkwo-Adeyemi Logistics" -> "OA". */
export function getInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .map((word) => word.match(/\p{L}|\p{N}/u)?.[0] ?? '')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Headline for a transaction: "Transfer out to Kwame Mensah", otherwise its narration. */
export function getTransactionTitle(tx: Transaction): string {
  if (tx.counterparty && tx.type === 'transfer_out') return `Transfer out to ${tx.counterparty}`
  if (tx.counterparty && tx.type === 'transfer_in') return `Transfer in from ${tx.counterparty}`
  return tx.narration
}
