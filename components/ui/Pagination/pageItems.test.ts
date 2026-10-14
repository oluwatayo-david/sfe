import { getPageItems } from './pageItems'

describe('getPageItems', () => {
  it('lists every page when there are few', () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('keeps a three-page window at the edges', () => {
    expect(getPageItems(1, 12)).toEqual([1, 2, 3, 'ellipsis-end', 12])
    expect(getPageItems(12, 12)).toEqual([1, 'ellipsis-start', 10, 11, 12])
  })

  it('centres the window on the current page', () => {
    expect(getPageItems(6, 12)).toEqual([1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 12])
  })

  it('shows a single hidden page instead of an ellipsis', () => {
    expect(getPageItems(4, 12)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 12])
    expect(getPageItems(9, 12)).toEqual([1, 'ellipsis-start', 8, 9, 10, 11, 12])
  })
})
