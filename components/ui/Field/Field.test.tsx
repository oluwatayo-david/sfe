import { render, screen } from '@testing-library/react'
import { Input } from '../Input'
import { Select } from '../Select'

describe('Field labels', () => {
  it('labels an Input, even when the label is visually hidden', () => {
    render(<Input label="Search" hideLabel />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
  })

  it('labels a Select', () => {
    render(<Select label="Status" options={[{ value: '', label: 'All statuses' }]} />)
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument()
  })

  it('keeps an explicit id', () => {
    render(<Input label="Amount" id="amount" />)
    expect(screen.getByLabelText('Amount')).toHaveAttribute('id', 'amount')
  })
})
