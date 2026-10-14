import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('shows a signed amount and a labelled status', () => {
    render(<TransactionRow transaction={{ ...base, type: 'card_payment', status: 'pending' }} />)
    expect(screen.getByText('-$45.99')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('marks money in as a credit', () => {
    render(<TransactionRow transaction={{ ...base, type: 'deposit', currency: 'NGN', amount: 2500000 }} />)
    expect(screen.getByText('+₦25,000.00')).toBeInTheDocument()
  })

  it('reports the selected transaction', async () => {
    const onSelect = vi.fn()
    render(<TransactionRow transaction={base} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(base)
  })
})
