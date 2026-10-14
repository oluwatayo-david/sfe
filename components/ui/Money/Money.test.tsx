import { render, screen } from '@testing-library/react'
import { Money } from './Money'

describe('Money', () => {
  it('always shows two decimals', () => {
    render(<Money amount={150050} currency="NGN" />)
    expect(screen.getByText('₦1,500.50')).toBeInTheDocument()
  })

  it('prefixes credits and debits', () => {
    render(
      <>
        <Money amount={2500000} currency="NGN" sign="credit" />
        <Money amount={4599} currency="USD" sign="debit" />
      </>
    )
    expect(screen.getByText('+₦25,000.00')).toBeInTheDocument()
    expect(screen.getByText('-$45.99')).toBeInTheDocument()
  })

  it('formats very large amounts without precision loss', () => {
    render(<Money amount={249_999_999_999} currency="NGN" />)
    expect(screen.getByText('₦2,499,999,999.99')).toBeInTheDocument()
  })
})
