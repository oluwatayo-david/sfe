import type { Transaction, TransactionType } from '@/types/api'
import { Icon, type IconName } from '@/components/ui'
import { cx } from '@/lib/cx'
import { getInitials } from '@/lib/format'
import styles from './TransactionAvatar.module.css'

const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

/** Counterparty initials when there is one (transfers), otherwise an icon for the type. Decorative. */
export function TransactionAvatar({
  transaction,
  size = 'md',
}: {
  transaction: Transaction
  size?: 'md' | 'lg'
}) {
  const initials = transaction.counterparty ? getInitials(transaction.counterparty) : ''
  return (
    <span className={cx(styles.avatar, styles[size])} aria-hidden>
      {initials || <Icon name={TYPE_ICONS[transaction.type]} size={size === 'lg' ? 20 : 18} />}
    </span>
  )
}
