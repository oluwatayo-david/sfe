import Link from 'next/link'
import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from '../Icon'
import { getPageItems } from './pageItems'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  totalPages: number
  /** Pages are links, so they can be opened in a new tab and keep working without JS. */
  getHref: (page: number) => string
  className?: string
}

/** Numbered pages on wide screens; "Page x of y" with Prev/Next on narrow ones. */
export function Pagination({ page, totalPages, getHref, className }: PaginationProps) {
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <nav className={cx(styles.pagination, className)} aria-label="Pagination">
      <StepLink href={hasPrevious ? getHref(page - 1) : null} rel="prev">
        <Icon name="chevron-left" size={16} />
        <span className={styles.wideOnly}>Previous</span>
        <span className={styles.narrowOnly}>Prev</span>
      </StepLink>

      <ol className={styles.pages}>
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <Link
                href={getHref(item)}
                className={cx(styles.page, item === page && styles.current)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </Link>
            </li>
          ) : (
            <li key={item} className={styles.ellipsis} aria-hidden>
              …
            </li>
          )
        )}
      </ol>

      <p className={styles.compact}>
        Page {page} of {totalPages}
      </p>

      <StepLink href={hasNext ? getHref(page + 1) : null} rel="next">
        Next
        <Icon name="chevron-right" size={16} />
      </StepLink>
    </nav>
  )
}

function StepLink({
  href,
  rel,
  children,
}: {
  href: string | null
  rel: 'prev' | 'next'
  children: ReactNode
}) {
  // Nothing to link to on the first/last page; render inert text rather than a dead link.
  if (!href) return <span className={cx(styles.step, styles.disabled)}>{children}</span>
  return (
    <Link
      href={href}
      rel={rel}
      className={styles.step}
      aria-label={rel === 'prev' ? 'Previous page' : 'Next page'}
    >
      {children}
    </Link>
  )
}
