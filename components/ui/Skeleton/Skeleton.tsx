import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  circle?: boolean
  className?: string
}

/** Placeholder block for content that is loading. Decorative: announce loading on the container. */
export function Skeleton({ width = '100%', height = 12, circle, className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, circle && styles.circle, className)}
      style={{ width, height: circle ? width : height }}
      aria-hidden
    />
  )
}
