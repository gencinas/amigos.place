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
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, Availability, AccommodationPhoto } from '@/types/database'

const accommodationLabels: Record<string, string> = {
  room: 'Private room',
  sofa: 'Sofa',
  airbed: 'Air bed',
  other: 'Other',
}

const statusLabels = {
  empty: 'Empty apartment',
  host_present: 'Host will be home',
  shared: 'Someone else present',
}

const paymentLabels = {
  free: 'Free',
  friend_price: 'Friend price',
  favor: 'Favor exchange',
  service: 'Service needed',
}

function getAvailabilityColor(a: Availability) {
  if (!a.payment_type || a.payment_type === 'free') return 'bg-emerald-100 text-emerald-800'
  if (a.payment_type === 'friend_price') return 'bg-blue-100 text-blue-800'
  return 'bg-orange-100 text-orange-800'
}

function getAvailabilitySummary(a: Availability) {
  const parts: string[] = []
  if (a.accommodation_status) parts.push(statusLabels[a.accommodation_status])
  if (a.payment_type === 'free') parts.push('Free')
  else if (a.payment_type === 'friend_price' && a.price_amount) {
    parts.push(`${a.price_currency || '€'}${a.price_amount}/night`)
  } else if (a.payment_type === 'favor' && a.favor_description) {
    parts.push(`Favor: ${a.favor_description}`)
  } else if (a.payment_type === 'service' && a.favor_description) {
    parts.push(`Service: ${a.favor_description}`)
  }
  if (a.notes) parts.push(a.notes)
  return parts.join(' — ')
}

interface Props {
  profile: Profile
  availabilities: Availability[]
  photos: AccommodationPhoto[]
  currentUser: Profile | null
  isOwnProfile: boolean
}

export default function PublicProfileClient({
  profile,
  availabilities,
  photos,
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
  const [photoIndex, setPhotoIndex] = useState(0)

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

  function getDateColor(date: Date) {
    const avail = getAvailabilityForDate(date)
    if (!avail) return ''
    return getAvailabilityColor(avail)
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
      const sameAvail = getAvailabilityForDate(date)
      if (sameAvail?.id === selectedAvailability?.id) {
        const [start, end] = selectedStart <= date ? [selectedStart, date] : [date, selectedStart]
        setSelectedStart(start)
        setSelectedEnd(end)
      } else {
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

  function getDefaultMessage() {
    if (!selectedAvailability) return ''
    if (selectedAvailability.payment_type === 'favor' && selectedAvailability.favor_description) {
      return `Hi! I'd love to stay. I saw you're looking for help with: ${selectedAvailability.favor_description}. Happy to help with that!`
    }
    if (selectedAvailability.payment_type === 'service' && selectedAvailability.favor_description) {
      return `Hi! I'd love to stay. I can help with: ${selectedAvailability.favor_description}.`
    }
    return ''
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
            const colorClass = available && !isPast ? getDateColor(day) : ''

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                disabled={isPast || !inMonth || !available}
                className={`
                  h-9 text-xs rounded-md transition-all duration-150
                  ${!inMonth ? 'invisible' : ''}
                  ${isPast ? 'text-muted-foreground/40' : ''}
                  ${available && !isPast ? `${colorClass} font-medium cursor-pointer hover:opacity-80 hover:scale-105` : ''}
                  ${!available && !isPast ? 'text-muted-foreground/60' : ''}
                  ${selected ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90 ring-2 ring-primary/30' : ''}
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
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-gradient-warm">amigos.place</Link>
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
        {/* Photo carousel */}
        {photos.length > 0 && (
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={photos[photoIndex].photo_url}
              alt={photos[photoIndex].caption || 'Accommodation'}
              className="w-full aspect-[16/9] object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {photos[photoIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
                <p className="text-white text-sm">{photos[photoIndex].caption}</p>
              </div>
            )}
          </div>
        )}

        {/* Profile info */}
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-20 h-20 rounded-full object-cover shrink-0 ring-4 ring-primary/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-medium shrink-0 ring-4 ring-primary/10">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{profile.display_name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {profile.city}, {profile.country}
            </p>
            <Badge variant="secondary">{accommodationLabels[profile.accommodation_type]}</Badge>
            {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
          </div>
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
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Color legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> Free</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> Friend price</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-200" /> Favor/Service</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {months.map(renderMonth)}
            </div>

            {/* Available periods list */}
            {availabilities.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium">Available periods:</h4>
                {availabilities.map((a) => {
                  const summary = getAvailabilitySummary(a)
                  return (
                    <div key={a.id} className={`text-sm border rounded-md px-3 py-2 ${getAvailabilityColor(a)}`}>
                      <span className="font-medium">
                        {format(parseISO(a.start_date), 'MMM d')} &rarr; {format(parseISO(a.end_date), 'MMM d, yyyy')}
                      </span>
                      {summary && (
                        <p className="mt-0.5 opacity-80">{summary}</p>
                      )}
                    </div>
                  )
                })}
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
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (open && !message) setMessage(getDefaultMessage())
              }}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full h-12 text-base rounded-full shadow-lg shadow-primary/25"
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
                          {format(selectedStart, 'MMM d, yyyy')} &rarr; {format(selectedEnd, 'MMM d, yyyy')}
                          {' '}in {profile.city}
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedAvailability && (selectedAvailability.accommodation_status || selectedAvailability.payment_type) && (
                    <div className="text-sm space-y-1 bg-muted/50 rounded-md p-3">
                      {selectedAvailability.accommodation_status && (
                        <p>{statusLabels[selectedAvailability.accommodation_status]}</p>
                      )}
                      {selectedAvailability.payment_type && (
                        <p className="font-medium">
                          {selectedAvailability.payment_type === 'free' && 'Free stay'}
                          {selectedAvailability.payment_type === 'friend_price' && `${selectedAvailability.price_currency || '€'}${selectedAvailability.price_amount}/night`}
                          {selectedAvailability.payment_type === 'favor' && `Favor: ${selectedAvailability.favor_description}`}
                          {selectedAvailability.payment_type === 'service' && `Service: ${selectedAvailability.favor_description}`}
                        </p>
                      )}
                    </div>
                  )}
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
              <Link href={`/onboarding?from=${profile.username}`}>
                <Button className="w-full h-12 text-base rounded-full shadow-lg shadow-primary/25">
                  Sign up to request a stay
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
