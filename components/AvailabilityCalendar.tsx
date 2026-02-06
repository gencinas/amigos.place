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
import { toast } from 'sonner'
import type { Availability } from '@/types/database'

interface Props {
  availabilities: Availability[]
  onUpdate: (availabilities: Availability[]) => void
}

export function AvailabilityCalendar({ availabilities, onUpdate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selecting, setSelecting] = useState<{ start: Date; end: Date | null } | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

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
      })
      .select()
      .single()

    if (error) {
      toast.error('Could not save availability')
    } else if (data) {
      onUpdate([...availabilities, data])
      toast.success('Availability added!')
    }

    setSelecting(null)
    setNotes('')
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
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
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
              <Input
                placeholder="Notes (e.g. I have a cat, can pick up from airport)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveAvailability} disabled={saving}>
                  {saving ? 'Saving...' : 'Add availability'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setSelecting(null); setNotes('') }}
                >
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
              className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">
                  {format(parseISO(a.start_date), 'MMM d')} → {format(parseISO(a.end_date), 'MMM d, yyyy')}
                </span>
                {a.notes && (
                  <span className="text-muted-foreground ml-2">— {a.notes}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
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
