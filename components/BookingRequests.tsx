'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { BookingStatus } from '@/types/database'

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

interface BookingWithGuest {
  id: string
  start_date: string
  end_date: string
  status: BookingStatus
  message: string
  created_at: string
  guest: { display_name: string; city: string; country: string; username: string }
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
      {bookings.map((b) => (
        <div key={b.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{b.guest.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {b.guest.city}, {b.guest.country}
              </p>
            </div>
            <Badge className={statusColors[b.status]}>{b.status}</Badge>
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
      ))}
    </div>
  )
}
