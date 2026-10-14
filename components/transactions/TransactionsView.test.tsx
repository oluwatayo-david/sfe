import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { AnchorHTMLAttributes } from 'react'
import type { Transaction } from '@/types/api'
import { TransactionsView } from './TransactionsView'

// --- Next router stand-in: an in-memory URL that the hooks subscribe to. ---
const nav = vi.hoisted(() => {
  let search = ''
  const listeners = new Set<() => void>()
  const go = (href: string) => {
    search = href.split('?')[1] ?? ''
    listeners.forEach((listener) => listener())
  }
  return {
    get search() {
      return search
    },
    reset: (value = '') => {
      search = value
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    push: vi.fn(go),
    replace: vi.fn(go),
    back: vi.fn(),
  }
})

vi.mock('next/navigation', async () => {
  const { useMemo, useSyncExternalStore } = await import('react')
  return {
    usePathname: () => '/transactions',
    useRouter: () => ({ push: nav.push, replace: nav.replace, back: nav.back }),
    useSearchParams: () => {
      const search = useSyncExternalStore(nav.subscribe, () => nav.search)
      return useMemo(() => new URLSearchParams(search), [search])
    },
  }
})

vi.mock('next/link', () => ({
  default: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props} />
  ),
}))

// --- API ---
const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'txn_1',
  reference: 'ACM-10000001',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 1549,
  fee: 0,
  narration: 'Card payment - Netflix',
  counterparty: null,
  createdAt: new Date().toISOString(),
  ...overrides,
})

const NETFLIX = tx({})
const TRANSFER = tx({
  id: 'txn_2',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
})
const ALL = [NETFLIX, TRANSFER]

const listRequests: URLSearchParams[] = []

function listHandler(respond?: (params: URLSearchParams) => Response | undefined) {
  return http.get('*/api/transactions', ({ request }) => {
    const params = new URL(request.url).searchParams
    listRequests.push(params)
    const custom = respond?.(params)
    if (custom) return custom
    const q = params.get('q')?.toLowerCase()
    const data = q ? ALL.filter((t) => t.narration.toLowerCase().includes(q)) : ALL
    return HttpResponse.json({ data, meta: { page: 1, limit: 20, total: data.length, totalPages: 1 } })
  })
}

const server = setupServer(
  listHandler(),
  http.get('*/api/transactions/:id', ({ params }) => {
    const found = ALL.find((t) => t.id === params.id)
    return found
      ? HttpResponse.json({ data: found })
      : HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 })
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  listRequests.length = 0
  vi.clearAllMocks()
})
afterAll(() => server.close())

function renderPage(search = '') {
  nav.reset(search)
  // No retries in tests: the error state should appear straight away.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <TransactionsView />
    </QueryClientProvider>
  )
}

describe('TransactionsView', () => {
  it('shows a skeleton, then transactions grouped by day', async () => {
    renderPage()
    expect(screen.getByText('Loading transactions')).toBeInTheDocument()

    expect(await screen.findByText('2 transactions')).toBeInTheDocument()
    const today = screen.getByRole('region', { name: 'Today' })
    expect(within(today).getAllByRole('button')).toHaveLength(2)
    expect(screen.getByText('Showing 1–2 of 2')).toBeInTheDocument()
  })

  it('shows an error with a working Try again', async () => {
    let fail = true
    server.use(
      listHandler(() =>
        fail
          ? HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Boom' } }, { status: 500 })
          : undefined
      )
    )
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load your transactions')
    fail = false
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('2 transactions')).toBeInTheDocument()
  })

  it('shows the empty state when there are no transactions at all', async () => {
    server.use(
      listHandler(() =>
        HttpResponse.json({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } })
      )
    )
    renderPage()
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
  })

  it('debounces search into a single request and keeps it in the URL', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('2 transactions')
    listRequests.length = 0

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'netflix')

    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(nav.search).toBe('q=netflix')
    expect(listRequests.map((params) => params.get('q'))).toEqual(['netflix'])
  })

  it('restores filters from the URL and clears them from the empty state', async () => {
    renderPage('q=nothing-matches&status=failed')

    const empty = await screen.findByText('No transactions match your filters')
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('nothing-matches')
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('failed')

    const emptyState = empty.closest('[role="status"]') as HTMLElement
    await userEvent.click(within(emptyState).getByRole('button', { name: 'Clear filters' }))
    expect(nav.search).toBe('')
    expect(await screen.findByText('2 transactions')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
  })

  it('opens details from a row and closes them with Back', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: /Transfer to Kwame Mensah/ }))

    expect(nav.push).toHaveBeenLastCalledWith('/transactions?tx=txn_2', { scroll: false })
    const dialog = screen.getByRole('dialog', { name: 'Transaction details' })
    expect(within(dialog).getByText('Transfer out to Kwame Mensah')).toBeInTheDocument()
    // Total = amount + fee (GH₵1,200.00 + GH₵12.00).
    expect(within(dialog).getByText('GH₵1,212.00')).toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(nav.back).toHaveBeenCalled()
  })

  it('shows not found for a shared link to a missing transaction', async () => {
    renderPage('tx=txn_missing')
    expect(await screen.findByText('Transaction not found')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Back to transactions' }))
    expect(nav.replace).toHaveBeenLastCalledWith('/transactions', { scroll: false })
  })
})
