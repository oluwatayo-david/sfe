'use client'
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { Icon } from '../Icon'
import styles from './Drawer.module.css'

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/**
 * Side panel on desktop, bottom sheet on small screens. Built on <dialog> + showModal(), which gives
 * focus trapping, Escape to close, an inert page behind it and focus restore on close.
 */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Clicks on the dialog element itself (not its content) land on the backdrop.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.drawer}
      aria-labelledby={titleId}
      onClick={handleClick}
      onCancel={(event) => {
        // Let the parent own the open state instead of the browser closing it.
        event.preventDefault()
        onClose()
      }}
    >
      {open && (
        <div className={styles.panel}>
          <span className={styles.handle} aria-hidden />
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
