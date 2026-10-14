import type { Transaction } from '@/types/api'
import { getInitials, getTransactionTitle, isCredit } from './transaction'

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'transfer_out',
  status: 'successful',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
  ...overrides,
})

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Ada Okafor')).toBe('AO')
    expect(getInitials('kwame mensah')).toBe('KM')
  })

  it('treats hyphenated names as separate words and skips symbols', () => {
    expect(getInitials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(getInitials('& Sons')).toBe('S')
  })

  it('handles a single name and empty input', () => {
    expect(getInitials('Chidi')).toBe('C')
    expect(getInitials('   ')).toBe('')
  })
})

describe('getTransactionTitle', () => {
  it('names the counterparty for transfers', () => {
    expect(getTransactionTitle(tx({}))).toBe('Transfer out to Kwame Mensah')
    expect(getTransactionTitle(tx({ type: 'transfer_in', counterparty: 'Ada Okafor' }))).toBe(
      'Transfer in from Ada Okafor'
    )
  })

  it('falls back to the narration', () => {
    expect(
      getTransactionTitle(
        tx({ type: 'card_payment', counterparty: null, narration: 'Card payment - Netflix' })
      )
    ).toBe('Card payment - Netflix')
  })
})

describe('isCredit', () => {
  it('treats money in as credit', () => {
    expect(isCredit('deposit')).toBe(true)
    expect(isCredit('conversion')).toBe(true)
    expect(isCredit('card_payment')).toBe(false)
  })
})
