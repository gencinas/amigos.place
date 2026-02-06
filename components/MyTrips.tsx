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

interface BookingWithHost {
  id: string
  start_date: string
  end_date: string
  status: BookingStatus
  message: string
  host: { display_name: string; city: string; country: string; username: string }
  [key: string]: unknown
}

export function MyTrips({ bookings: initial }: { bookings: Array<Record<string, unknown>> }) {
  const [bookings, setBookings] = useState(initial as unknown as BookingWithHost[])
  const [cancelling, setCancelling] = useState<string | null>(null)

  async function cancelBooking(id: string) {
    setCancelling(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' as BookingStatus })
      .eq('id', id)

    if (error) {
      toast.error('Could not cancel booking')
    } else {
      setBookings(bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b
      ))
      toast.success('Booking cancelled')
    }
    setCancelling(null)
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const sv = statusVariants[b.status]
        return (
          <div key={b.id} className="border rounded-lg p-4 space-y-2 transition-shadow hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Staying with {b.host.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {b.host.city}, {b.host.country}
                </p>
              </div>
              <Badge variant={sv.variant} className={sv.className}>{sv.label}</Badge>
            </div>
            <p className="text-sm">
              {format(parseISO(b.start_date), 'MMM d')} → {format(parseISO(b.end_date), 'MMM d, yyyy')}
            </p>
            {b.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => cancelBooking(b.id)}
                disabled={cancelling === b.id}
              >
                Cancel request
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
