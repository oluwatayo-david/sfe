import { render, screen } from '@testing-library/react'
import { Navbar } from './Navbar'

vi.mock('next/navigation', () => ({ usePathname: () => '/transactions' }))
vi.mock('./UserMenu', () => ({ UserMenu: () => null }))

describe('Navbar', () => {
  it('marks the current route as the active page', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })
})
