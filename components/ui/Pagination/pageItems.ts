export type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

const MAX_WITHOUT_ELLIPSIS = 7

/**
 * Page numbers to show: first, last, and a window of three around the current page, with ellipses
 * for gaps. An ellipsis never stands in for a single page. e.g. page 1 of 12 -> 1 2 3 … 12
 */
export function getPageItems(current: number, total: number): PageItem[] {
  if (total <= MAX_WITHOUT_ELLIPSIS) return Array.from({ length: total }, (_, i) => i + 1)

  let start = Math.max(2, current - 1)
  let end = Math.min(total - 1, current + 1)
  // Keep the window three pages wide at either edge.
  if (current <= 2) end = 3
  if (current >= total - 1) start = total - 2

  const items: PageItem[] = [1]
  if (start === 3) items.push(2)
  else if (start > 3) items.push('ellipsis-start')
  for (let page = start; page <= end; page++) items.push(page)
  if (end === total - 2) items.push(total - 1)
  else if (end < total - 2) items.push('ellipsis-end')
  items.push(total)
  return items
}
