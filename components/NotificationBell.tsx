'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'

export function NotificationBell({ count }: { count: number }) {
  return (
    <Link href="/dashboard" className="relative p-2" title="Pending requests">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  )
}
