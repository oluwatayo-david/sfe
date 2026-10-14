'use client'
import { useEffect, useState } from 'react'
import type { User } from '@/types/api'
import { Avatar, Icon } from '@/components/ui'
import { getMe } from '@/lib/api/endpoints'
import styles from './UserMenu.module.css'

const TIER_LABELS: Record<User['tier'], string> = {
  basic: 'Basic',
  verified: 'Verified',
  premium: 'Premium',
}

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User>()

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      // The menu works without the user (avatar placeholder, no name), so a failed /me isn't fatal.
      .catch(() => setUser(undefined))
  }, [])

  return (
    <div className={styles.menu}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        // The visible name is hidden on mobile and missing when /me fails, so name the button
        // explicitly. It starts with the visible name so voice control can still target it.
        aria-label={user ? `${user.firstName}, account menu` : 'Account menu'}
      >
        <Avatar src={user?.avatarUrl ?? null} alt="" size="sm" />
        <span className={styles.name}>{user?.firstName}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.fullName}>
            {user?.firstName} {user?.lastName}
          </div>
          <div className={styles.email}>{user?.email}</div>
          {user && <div className={styles.tier}>{TIER_LABELS[user.tier]} account</div>}
        </div>
      )}
    </div>
  )
}
