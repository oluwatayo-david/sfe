import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './StateMessage.module.css'

export interface StateMessageProps {
  icon: IconName
  title: string
  description?: ReactNode
  /** Usually a Button. */
  action?: ReactNode
  tone?: 'primary' | 'danger'
  /** 'alert' announces the message to screen readers when it appears (use for errors). */
  role?: 'status' | 'alert'
  className?: string
}

/** Centred icon + message for empty, error and not-found states. */
export function StateMessage({
  icon,
  title,
  description,
  action,
  tone = 'primary',
  role = 'status',
  className,
}: StateMessageProps) {
  return (
    <div className={cx(styles.state, className)} role={role}>
      <span className={cx(styles.icon, styles[tone])}>
        <Icon name={icon} size={22} />
      </span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
