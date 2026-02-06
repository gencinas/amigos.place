'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  parseISO,
} from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { Availability, AccommodationStatus, PaymentType } from '@/types/database'

interface Props {
  availabilities: Availability[]
  onUpdate: (availabilities: Availability[]) => void
}

const statusLabels: Record<AccommodationStatus, string> = {
  empty: 'Empty apartment',
  host_present: 'Host will be home',
  shared: 'Someone else present',
}

const paymentLabels: Record<PaymentType, string> = {
  free: 'Free',
  friend_price: 'Friend price',
  favor: 'Favor exchange',
  service: 'Service needed',
}

export function AvailabilityCalendar({ availabilities, onUpdate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selecting, setSelecting] = useState<{ start: Date; end: Date | null } | null>(null)
  const [notes, setNotes] = useState('')
  const [accommodationStatus, setAccommodationStatus] = useState<AccommodationStatus>('empty')
  const [paymentType, setPaymentType] = useState<PaymentType>('free')
  const [priceAmount, setPriceAmount] = useState('')
  const [favorDescription, setFavorDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function resetForm() {
    setSelecting(null)
    setNotes('')
    setAccommodationStatus('empty')
    setPaymentType('free')
    setPriceAmount('')
    setFavorDescription('')
  }

  function isDateAvailable(date: Date) {
    return availabilities.some((a) =>
      isWithinInterval(date, {
        start: parseISO(a.start_date),
        end: parseISO(a.end_date),
      })
    )
  }

  function isDateSelected(date: Date) {
    if (!selecting?.start) return false
    if (!selecting.end) return isSameDay(date, selecting.start)
    const [s, e] = selecting.start <= selecting.end
      ? [selecting.start, selecting.end]
      : [selecting.end, selecting.start]
    return isWithinInterval(date, { start: s, end: e })
  }

  function handleDayClick(date: Date) {
    if (isBefore(date, today)) return

    if (!selecting) {
      setSelecting({ start: date, end: null })
    } else if (!selecting.end) {
      const [start, end] = selecting.start <= date
        ? [selecting.start, date]
        : [date, selecting.start]
      setSelecting({ start, end })
    } else {
      setSelecting({ start: date, end: null })
    }
  }

  async function saveAvailability() {
    if (!selecting?.start || !selecting?.end) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('availabilities')
      .insert({
        user_id: user.id,
        start_date: format(selecting.start, 'yyyy-MM-dd'),
        end_date: format(selecting.end, 'yyyy-MM-dd'),
        notes: notes || null,
        accommodation_status: accommodationStatus,
        payment_type: paymentType,
        price_amount: paymentType === 'friend_price' && priceAmount ? parseFloat(priceAmount) : null,
        price_currency: 'EUR',
        favor_description: (paymentType === 'favor' || paymentType === 'service') ? favorDescription || null : null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Could not save availability')
    } else if (data) {
      onUpdate([...availabilities, data])
      toast.success('Availability added!')
    }

    resetForm()
    setSaving(false)
  }

  async function deleteAvailability(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('availabilities').delete().eq('id', id)

    if (error) {
      toast.error('Could not delete')
    } else {
      onUpdate(availabilities.filter((a) => a.id !== id))
      toast.success('Removed')
    }
  }

  function getAvailabilityBadge(a: Availability) {
    const parts: string[] = []
    if (a.accommodation_status) parts.push(statusLabels[a.accommodation_status])
    if (a.payment_type === 'free') parts.push('Free')
    else if (a.payment_type === 'friend_price' && a.price_amount) parts.push(`€${a.price_amount}/night`)
    else if (a.payment_type === 'favor') parts.push('Favor')
    else if (a.payment_type === 'service') parts.push('Service')
    return parts.join(' · ')
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
                disabled={isPast || !inMonth}
                className={`
                  h-9 text-xs rounded-md transition-colors
                  ${!inMonth ? 'invisible' : ''}
                  ${isPast ? 'text-muted-foreground/40 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'}
                  ${available ? 'bg-emerald-100 text-emerald-800 font-medium' : ''}
                  ${selected ? 'bg-primary text-primary-foreground font-medium' : ''}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {months.map(renderMonth)}
      </div>

      {/* Selection panel */}
      {selecting?.start && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <p className="text-sm">
            <span className="font-medium">Selected: </span>
            {format(selecting.start, 'MMM d, yyyy')}
            {selecting.end && ` → ${format(selecting.end, 'MMM d, yyyy')}`}
            {!selecting.end && (
              <span className="text-muted-foreground"> (click end date)</span>
            )}
          </p>

          {selecting.end && (
            <>
              {/* Accommodation status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accommodation status</Label>
                <div className="flex flex-col gap-2">
                  {(Object.entries(statusLabels) as [AccommodationStatus, string][]).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accommodation_status"
                        value={value}
                        checked={accommodationStatus === value}
                        onChange={() => setAccommodationStatus(value)}
                        className="accent-primary"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">What are you looking for?</Label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_type"
                      checked={paymentType === 'free'}
                      onChange={() => setPaymentType('free')}
                      className="accent-primary"
                    />
                    <span className="text-sm">Free — just helping friends!</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_type"
                      checked={paymentType === 'friend_price'}
                      onChange={() => setPaymentType('friend_price')}
                      className="accent-primary"
                    />
                    <span className="text-sm">Friend price</span>
                  </label>
                  {paymentType === 'friend_price' && (
                    <div className="ml-6 flex items-center gap-2">
                      <span className="text-sm">€</span>
                      <Input
                        type="number"
                        placeholder="20"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        className="w-24 h-8"
                      />
                      <span className="text-sm text-muted-foreground">per night</span>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_type"
                      checked={paymentType === 'favor'}
                      onChange={() => setPaymentType('favor')}
                      className="accent-primary"
                    />
                    <span className="text-sm">A favor in exchange</span>
                  </label>
                  {paymentType === 'favor' && (
                    <Textarea
                      className="ml-6 text-sm"
                      placeholder="e.g., water my plants, walk my dog"
                      value={favorDescription}
                      onChange={(e) => setFavorDescription(e.target.value)}
                      rows={2}
                    />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_type"
                      checked={paymentType === 'service'}
                      onChange={() => setPaymentType('service')}
                      className="accent-primary"
                    />
                    <span className="text-sm">Specific service needed</span>
                  </label>
                  {paymentType === 'service' && (
                    <Textarea
                      className="ml-6 text-sm"
                      placeholder="e.g., pet sitting, plant care"
                      value={favorDescription}
                      onChange={(e) => setFavorDescription(e.target.value)}
                      rows={2}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This helps your friends know what to expect</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional notes</Label>
                <Textarea
                  placeholder="e.g., I have a cat, can pick up from airport, spare key with neighbor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={saveAvailability} disabled={saving}>
                  {saving ? 'Saving...' : 'Add availability'}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Existing availabilities */}
      {availabilities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Your available periods:</h4>
          {availabilities.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between border rounded-md px-3 py-2 text-sm"
            >
              <div className="space-y-0.5">
                <span className="font-medium">
                  {format(parseISO(a.start_date), 'MMM d')} → {format(parseISO(a.end_date), 'MMM d, yyyy')}
                </span>
                {getAvailabilityBadge(a) && (
                  <p className="text-xs text-muted-foreground">{getAvailabilityBadge(a)}</p>
                )}
                {a.favor_description && (
                  <p className="text-xs text-muted-foreground italic">{a.favor_description}</p>
                )}
                {a.notes && (
                  <p className="text-xs text-muted-foreground">Note: {a.notes}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => deleteAvailability(a.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
