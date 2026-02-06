'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isWithinInterval,
  isBefore,
  parseISO,
} from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Profile, Availability } from '@/types/database'

const accommodationLabels = {
  room: 'Private room',
  sofa: 'Sofa',
  other: 'Other',
}

interface Props {
  profile: Profile
  availabilities: Availability[]
  currentUser: Profile | null
  isOwnProfile: boolean
}

export default function PublicProfileClient({
  profile,
  availabilities,
  currentUser,
  isOwnProfile,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function isDateAvailable(date: Date) {
    return availabilities.some((a) =>
      isWithinInterval(date, {
        start: parseISO(a.start_date),
        end: parseISO(a.end_date),
      })
    )
  }

  function getAvailabilityForDate(date: Date) {
    return availabilities.find((a) =>
      isWithinInterval(date, {
        start: parseISO(a.start_date),
        end: parseISO(a.end_date),
      })
    )
  }

  function handleDayClick(date: Date) {
    if (!isDateAvailable(date)) return
    const avail = getAvailabilityForDate(date)
    if (!avail) return

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date)
      setSelectedEnd(null)
      setSelectedAvailability(avail)
    } else {
      // Ensure both dates are within the same availability
      const sameAvail = getAvailabilityForDate(date)
      if (sameAvail?.id === selectedAvailability?.id) {
        const [start, end] = selectedStart <= date ? [selectedStart, date] : [date, selectedStart]
        setSelectedStart(start)
        setSelectedEnd(end)
      } else {
        // Different availability, start new selection
        setSelectedStart(date)
        setSelectedEnd(null)
        setSelectedAvailability(sameAvail || null)
      }
    }
  }

  function isDateSelected(date: Date) {
    if (!selectedStart) return false
    if (!selectedEnd) return date.getTime() === selectedStart.getTime()
    return isWithinInterval(date, { start: selectedStart, end: selectedEnd })
  }

  async function sendRequest() {
    if (!selectedStart || !selectedEnd || !currentUser) return
    setSending(true)

    const supabase = createClient()
    const { error } = await supabase.from('bookings').insert({
      host_id: profile.id,
      guest_id: currentUser.id,
      start_date: format(selectedStart, 'yyyy-MM-dd'),
      end_date: format(selectedEnd, 'yyyy-MM-dd'),
      message: message,
    })

    if (error) {
      toast.error('Could not send request')
    } else {
      toast.success('Request sent! The host will be notified.')
      setDialogOpen(false)
      setSelectedStart(null)
      setSelectedEnd(null)
      setMessage('')
    }
    setSending(false)
  }

  function renderMonth(monthDate: Date) {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: calStart, end: calEnd })

    return (
      <div key={monthDate.toISOString()}>
        <h3 className="font-semibold text-sm mb-2">{format(monthDate, 'MMMM yyyy')}</h3>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d} className="text-[10px] text-muted-foreground py-1">{d}</div>
          ))}
          {days.map((day) => {
            const inMonth = isSameMonth(day, monthDate)
            const isPast = isBefore(day, today)
            const available = isDateAvailable(day)
            const selected = isDateSelected(day)

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                disabled={isPast || !inMonth || !available}
                className={`
                  h-9 text-xs rounded-md transition-colors
                  ${!inMonth ? 'invisible' : ''}
                  ${isPast ? 'text-muted-foreground/40' : ''}
                  ${available && !isPast ? 'bg-emerald-100 text-emerald-800 font-medium cursor-pointer hover:bg-emerald-200' : ''}
                  ${!available && !isPast ? 'text-muted-foreground/60' : ''}
                  ${selected ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const months = [0, 1, 2, 3].map((i) => addMonths(currentMonth, i))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">amigos.place</Link>
          {currentUser ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Profile info */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{profile.display_name}</h1>
          <p className="text-muted-foreground">
            {profile.city}, {profile.country}
          </p>
          <Badge variant="secondary">{accommodationLabels[profile.accommodation_type]}</Badge>
          {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
        </div>

        {isOwnProfile && (
          <div className="bg-muted/50 border rounded-lg p-3 text-sm text-muted-foreground">
            This is how your profile looks to friends. Share this link!
          </div>
        )}

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              >
                &larr; Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                Next &rarr;
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {months.map(renderMonth)}
            </div>

            {/* Available periods list */}
            {availabilities.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium">Available periods:</h4>
                {availabilities.map((a) => (
                  <div key={a.id} className="text-sm border rounded-md px-3 py-2">
                    <span className="font-medium">
                      {format(parseISO(a.start_date), 'MMM d')} → {format(parseISO(a.end_date), 'MMM d, yyyy')}
                    </span>
                    {a.notes && (
                      <span className="text-muted-foreground ml-2">— {a.notes}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {availabilities.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                No available dates at the moment.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Request button */}
        {!isOwnProfile && (
          <div className="sticky bottom-4">
            {currentUser ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full h-12 text-base"
                    disabled={!selectedStart || !selectedEnd}
                  >
                    {selectedStart && selectedEnd
                      ? `Request to stay: ${format(selectedStart, 'MMM d')} → ${format(selectedEnd, 'MMM d')}`
                      : 'Select dates on the calendar above'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request to stay with {profile.display_name}</DialogTitle>
                    <DialogDescription>
                      {selectedStart && selectedEnd && (
                        <>
                          {format(selectedStart, 'MMM d, yyyy')} → {format(selectedEnd, 'MMM d, yyyy')}
                          {' '}in {profile.city}
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Write a message to your host (introduce yourself, what brings you to the city, etc.)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                    <Button
                      className="w-full"
                      onClick={sendRequest}
                      disabled={sending}
                    >
                      {sending ? 'Sending...' : 'Send request'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Link href={`/auth/login`}>
                <Button className="w-full h-12 text-base">
                  Sign in to request a stay
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
