import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionRow } from './TransactionRow'

const base: Transaction = {
  id: 'txn_1',
  reference: 'ACM-10000001',
  type: 'bill_payment',
  status: 'successful',
  currency: 'USD',
  amount: 4599,
  fee: 0,
  narration: 'Bill payment - Spectranet',
  counterparty: null,
  createdAt: '2026-09-30T14:22:00.000Z',
}

describe('TransactionRow', () => {
  it('renders narration from upstream providers as text, not HTML', () => {
    const narration = 'Bill payment - Spectranet <img src="x" onerror="alert(1)">'
    const { container } = render(<TransactionRow transaction={{ ...base, narration }} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(narration)).toBeInTheDocument()
  })

  it('formats the fee in the transaction currency', () => {
    render(<TransactionRow transaction={{ ...base, type: 'withdrawal', fee: 250 }} />)
    expect(screen.getByText(/Fee \$2\.50/)).toBeInTheDocument()
  })
})
