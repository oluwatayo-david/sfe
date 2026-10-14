import { render, screen } from '@testing-library/react'
import { getMe } from '@/lib/api/endpoints'
import type { User } from '@/types/api'
import { UserMenu } from './UserMenu'

vi.mock('@/lib/api/endpoints', () => ({ getMe: vi.fn() }))

const user: User = {
  id: 'usr_1',
  firstName: 'Amara',
  lastName: 'Okafor',
  email: 'amara@example.com',
  avatarUrl: null,
  tier: 'verified',
  wallets: [],
}

describe('UserMenu', () => {
  it('names the trigger after the user', async () => {
    vi.mocked(getMe).mockResolvedValue({ data: user })
    render(<UserMenu />)
    expect(await screen.findByRole('button', { name: 'Amara, account menu' })).toBeInTheDocument()
  })

  it('still names the trigger when /me fails', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('boom'))
    render(<UserMenu />)
    expect(await screen.findByRole('button', { name: 'Account menu' })).toBeInTheDocument()
  })
})
