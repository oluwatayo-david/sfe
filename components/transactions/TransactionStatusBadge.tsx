import type { TransactionStatus } from '@/types/api'
import { Badge, type BadgeTone } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS } from '@/lib/format'

const STATUS_TONES: Record<TransactionStatus, BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}

/** Status as a labelled badge, so it isn't conveyed by colour alone. */
export function TransactionStatusBadge({
  status,
  className,
}: {
  status: TransactionStatus
  className?: string
}) {
  return (
    <Badge tone={STATUS_TONES[status]} dot className={className}>
      {TRANSACTION_STATUS_LABELS[status]}
    </Badge>
  )
}
