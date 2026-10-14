import { hasFilters, parseParams, toListQuery, updateSearch } from './searchParams'

const parse = (qs: string) => parseParams(new URLSearchParams(qs))

describe('parseParams', () => {
  it('defaults to the first page with no filters', () => {
    expect(parse('')).toEqual({ q: '', type: undefined, status: undefined, page: 1, tx: undefined })
  })

  it('reads valid params', () => {
    expect(parse('q=netflix&type=card_payment&status=failed&page=3&tx=txn_1')).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      page: 3,
      tx: 'txn_1',
    })
  })

  it('drops values the API would reject', () => {
    expect(parse('type=refund&status=reversed&page=-2')).toMatchObject({
      type: undefined,
      status: undefined,
      page: 1,
    })
    expect(parse('page=1.5').page).toBe(1)
    expect(parse('page=abc').page).toBe(1)
    expect(parse('type=toString').type).toBeUndefined()
  })

  it('trims the search term', () => {
    expect(parse('q=%20%20netflix%20').q).toBe('netflix')
  })
})

describe('updateSearch', () => {
  const current = (qs: string) => new URLSearchParams(qs)

  it('returns to page 1 when a filter changes', () => {
    expect(updateSearch(current('page=4&status=failed'), { status: 'pending' })).toBe('?status=pending')
    expect(updateSearch(current('page=4'), { q: 'netflix' })).toBe('?q=netflix')
  })

  it('keeps the page when only the details drawer changes', () => {
    expect(updateSearch(current('page=4'), { tx: 'txn_1' })).toBe('?page=4&tx=txn_1')
    expect(updateSearch(current('page=4&tx=txn_1'), { tx: null })).toBe('?page=4')
  })

  it('omits defaults and empty values', () => {
    expect(updateSearch(current('page=2'), { page: 1 })).toBe('')
    expect(updateSearch(current('q=netflix'), { q: '' })).toBe('')
  })

  it('keeps params it does not own, like __scenario', () => {
    expect(updateSearch(current('__scenario=slow'), { type: 'deposit' })).toBe(
      '?__scenario=slow&type=deposit'
    )
  })

  it('does not reset the page when a filter is set to its current value', () => {
    expect(updateSearch(current('status=failed&page=2'), { status: 'failed' })).toBe('?status=failed&page=2')
  })
})

describe('toListQuery / hasFilters', () => {
  it('builds the API query from params', () => {
    expect(toListQuery(parse('q=net&page=2&tx=txn_1'))).toEqual({
      page: 2,
      limit: 20,
      q: 'net',
      type: undefined,
      status: undefined,
    })
  })

  it('knows when any filter is set', () => {
    expect(hasFilters(parse('page=3&tx=txn_1'))).toBe(false)
    expect(hasFilters(parse('status=failed'))).toBe(true)
  })
})
