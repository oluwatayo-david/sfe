import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SEARCH_DEBOUNCE_MS, TransactionFilters, type TransactionFiltersProps } from './TransactionFilters'

function setup(props: Partial<TransactionFiltersProps> = {}) {
  const handlers = { onSearch: vi.fn(), onChange: vi.fn(), onClear: vi.fn() }
  const all: TransactionFiltersProps = { q: '', showClear: false, ...handlers, ...props }
  const view = render(<TransactionFilters {...all} />)
  const rerender = (next: Partial<TransactionFiltersProps>) =>
    view.rerender(<TransactionFilters {...all} {...next} />)
  return { ...handlers, rerender, box: screen.getByRole('searchbox', { name: 'Search' }) }
}

/** Wait past the debounce window (real timers; it's only 300ms). */
const pastDebounce = () => new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50))

describe('TransactionFilters search', () => {
  it('commits once, trimmed, after typing pauses', async () => {
    const { onSearch, box } = setup()
    await userEvent.type(box, ' netflix ')
    expect(onSearch).not.toHaveBeenCalled()

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('netflix'))
    await pastDebounce()
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('commits straight away on Enter', async () => {
    const { onSearch, box } = setup()
    await userEvent.type(box, 'netflix{Enter}')
    expect(onSearch).toHaveBeenCalledWith('netflix')
  })

  it('shows a search changed from outside (Back, a link)', () => {
    const { rerender, box } = setup({ q: 'netflix' })
    rerender({ q: 'uber' })
    expect(box).toHaveValue('uber')
  })

  it('does not overwrite newer typing when the URL catches up', async () => {
    const { onSearch, rerender, box } = setup()
    await userEvent.type(box, 'net')
    await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith('net'))

    // The user keeps typing before the router has applied ?q=net …
    await userEvent.type(box, 'f')
    // … then the URL arrives with the earlier term.
    rerender({ q: 'net' })
    expect(box).toHaveValue('netf')
  })

  it('follows Back and Forward after the user searched', async () => {
    const { onSearch, rerender, box } = setup()
    await userEvent.type(box, 'net')
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('net'))
    rerender({ q: 'net' }) // the URL applies our search

    rerender({ q: '' }) // Back
    expect(box).toHaveValue('')
    rerender({ q: 'net' }) // Forward
    expect(box).toHaveValue('net')
  })

  it('clears the box and drops a pending search on Clear filters', async () => {
    const { onSearch, onClear, box } = setup({ q: 'netflix', showClear: true })
    await userEvent.type(box, 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    await pastDebounce()

    expect(onClear).toHaveBeenCalled()
    expect(onSearch).not.toHaveBeenCalled()
    expect(box).toHaveValue('')
  })
})
