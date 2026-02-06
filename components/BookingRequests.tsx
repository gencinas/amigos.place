'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { BookingStatus } from '@/types/database'

const statusVariants: Record<BookingStatus, { variant: 'outline'; className: string; label: string }> = {
  pending: { variant: 'outline', className: 'border-yellow-300 text-yellow-700 bg-yellow-50', label: 'Pending' },
  accepted: { variant: 'outline', className: 'border-emerald-300 text-emerald-700 bg-emerald-50', label: 'Accepted' },
  declined: { variant: 'outline', className: 'border-red-300 text-red-700 bg-red-50', label: 'Declined' },
  cancelled: { variant: 'outline', className: 'border-gray-300 text-gray-700 bg-gray-50', label: 'Cancelled' },
}

interface BookingWithGuest {
  id: string
  start_date: string
  end_date: string
  status: BookingStatus
  message: string
  created_at: string
  guest: { display_name: string; city: string; country: string; username: string; avatar_url: string | null }
  [key: string]: unknown
}

export function BookingRequests({ bookings: initial }: { bookings: Array<Record<string, unknown>> }) {
  const [bookings, setBookings] = useState(initial as unknown as BookingWithGuest[])
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdating(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Could not update booking')
    } else {
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)))
      toast.success(status === 'accepted' ? 'Booking accepted!' : 'Booking declined')
    }
    setUpdating(null)
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const sv = statusVariants[b.status]
        return (
          <div key={b.id} className="border rounded-lg p-4 space-y-2 transition-shadow hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {b.guest.avatar_url ? (
                  <img src={b.guest.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {b.guest.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{b.guest.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.guest.city}, {b.guest.country}
                  </p>
                </div>
              </div>
              <Badge variant={sv.variant} className={sv.className}>{sv.label}</Badge>
            </div>
            <p className="text-sm">
              {format(parseISO(b.start_date), 'MMM d')} → {format(parseISO(b.end_date), 'MMM d, yyyy')}
            </p>
            {b.message && (
              <p className="text-sm text-muted-foreground italic">&ldquo;{b.message}&rdquo;</p>
            )}
            {b.status === 'pending' && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => updateStatus(b.id, 'accepted')}
                  disabled={updating === b.id}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(b.id, 'declined')}
                  disabled={updating === b.id}
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
