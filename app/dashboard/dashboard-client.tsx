'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/Header'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import { BookingRequests } from '@/components/BookingRequests'
import { MyTrips } from '@/components/MyTrips'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Profile, Availability } from '@/types/database'

interface DashboardClientProps {
  profile: Profile
  availabilities: Availability[]
  hostBookings: Array<Record<string, unknown>>
  guestBookings: Array<Record<string, unknown>>
}

export default function DashboardClient({
  profile,
  availabilities: initialAvailabilities,
  hostBookings,
  guestBookings,
}: DashboardClientProps) {
  const [availabilities, setAvailabilities] = useState(initialAvailabilities)
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${profile.username}`
  const pendingHostBookings = hostBookings.filter((b) => b.status === 'pending')

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
    toast.success('Link copied!')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header profile={profile} pendingCount={pendingHostBookings.length} />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome + Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hey, {profile.display_name}!</h1>
            <p className="text-muted-foreground text-sm">
              {profile.city}, {profile.country}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-muted px-3 py-1.5 rounded-md truncate max-w-[250px]">
              {publicUrl}
            </code>
            <Button variant="outline" size="sm" onClick={copyLink}>
              Copy
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-2xl font-bold">{availabilities.length}</p>
              <p className="text-xs text-muted-foreground">Available periods</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-2xl font-bold">{pendingHostBookings.length}</p>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-2xl font-bold">
                {hostBookings.filter((b) => b.status === 'accepted').length}
              </p>
              <p className="text-xs text-muted-foreground">Accepted visits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-2xl font-bold">
                {guestBookings.filter((b) => b.status === 'accepted').length}
              </p>
              <p className="text-xs text-muted-foreground">Your trips</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Availability Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Your Availability
              <Badge variant="secondary">{availabilities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar
              availabilities={availabilities}
              onUpdate={setAvailabilities}
            />
          </CardContent>
        </Card>

        {/* Booking Requests (as host) */}
        {hostBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Stay Requests
                {pendingHostBookings.length > 0 && (
                  <Badge variant="destructive">{pendingHostBookings.length} new</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BookingRequests bookings={hostBookings} />
            </CardContent>
          </Card>
        )}

        {/* My Trips (as guest) */}
        {guestBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <MyTrips bookings={guestBookings} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
