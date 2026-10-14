import type { Transaction } from '@/types/api'
import { groupByDay } from './grouping'

const at = (createdAt: string, id = createdAt): Transaction => ({
  id,
  reference: 'ACM-1',
  type: 'deposit',
  status: 'successful',
  currency: 'NGN',
  amount: 100,
  fee: 0,
  narration: 'Wallet top-up via bank transfer',
  counterparty: null,
  createdAt,
})

// Local-time dates, so the test passes in any timezone.
const local = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString()

describe('groupByDay', () => {
  const now = new Date(2026, 9, 14, 9, 0)

  it('labels today and yesterday, then dates', () => {
    const groups = groupByDay(
      [
        at(local(2026, 10, 14, 8)),
        at(local(2026, 10, 14, 1)),
        at(local(2026, 10, 13)),
        at(local(2026, 10, 5)),
      ],
      now
    )
    expect(groups.map((g) => [g.label, g.transactions.length])).toEqual([
      ['Today', 2],
      ['Yesterday', 1],
      ['Mon, 5 Oct 2026', 1],
    ])
  })

  it('returns no groups for an empty list', () => {
    expect(groupByDay([], now)).toEqual([])
  })
})
