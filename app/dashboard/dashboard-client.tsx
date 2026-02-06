'use client'

import { useState, useRef } from 'react'
import { Header } from '@/components/Header'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import { BookingRequests } from '@/components/BookingRequests'
import { MyTrips } from '@/components/MyTrips'
import { AvatarUpload } from '@/components/AvatarUpload'
import { AccommodationPhotosUpload } from '@/components/AccommodationPhotosUpload'
import { ShareCard } from './components/share-card'
import { CalendarPrompt } from './components/calendar-prompt'
import { EmptyRequests } from './components/empty-requests'
import { EmptyTrips } from './components/empty-trips'
import { ProfileCompleteness } from './components/profile-completeness'
import { HostBanner } from './components/host-banner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, Clock, CheckCircle, Plane, Camera } from 'lucide-react'
import type { Profile, Availability, AccommodationPhoto } from '@/types/database'

interface DashboardClientProps {
  profile: Profile
  availabilities: Availability[]
  hostBookings: Array<Record<string, unknown>>
  guestBookings: Array<Record<string, unknown>>
  photos: AccommodationPhoto[]
}

export default function DashboardClient({
  profile: initialProfile,
  availabilities: initialAvailabilities,
  hostBookings,
  guestBookings,
  photos: initialPhotos,
}: DashboardClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [availabilities, setAvailabilities] = useState(initialAvailabilities)
  const [photos, setPhotos] = useState(initialPhotos)
  const calendarRef = useRef<HTMLDivElement>(null)
  const pendingHostBookings = hostBookings.filter((b) => b.status === 'pending')
  const isGuest = profile.intent === 'guest'

  function scrollToCalendar() {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header profile={profile} pendingCount={pendingHostBookings.length} />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">Hey, {profile.display_name}!</h1>
          <p className="text-muted-foreground text-sm">
            {profile.city}, {profile.country}
          </p>
        </div>

        {/* Share Card */}
        <ShareCard username={profile.username} city={profile.city} />

        {/* Host Banner (only for guests) */}
        {isGuest && <HostBanner />}

        {/* Calendar Prompt (only for hosts with no availabilities) */}
        {!isGuest && availabilities.length === 0 && (
          <CalendarPrompt onScrollToCalendar={scrollToCalendar} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {!isGuest && (
            <>
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{availabilities.length}</p>
                  <p className="text-xs text-muted-foreground">Available periods</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{pendingHostBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Pending requests</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {hostBookings.filter((b) => b.status === 'accepted').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Accepted visits</p>
                </CardContent>
              </Card>
            </>
          )}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-violet-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {guestBookings.filter((b) => b.status === 'accepted').length}
              </p>
              <p className="text-xs text-muted-foreground">Your trips</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Photos section (host only) */}
        {!isGuest && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Your Photos
                  <Badge variant="secondary">{photos.length}</Badge>
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Edit photos</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit your photos</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium mb-3">Profile photo</p>
                        <AvatarUpload
                          userId={profile.id}
                          currentUrl={profile.avatar_url}
                          onUploaded={(url) => setProfile({ ...profile, avatar_url: url })}
                        />
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-3">Accommodation photos</p>
                        <AccommodationPhotosUpload
                          userId={profile.id}
                          photos={photos}
                          onUpdate={setPhotos}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            {photos.length > 0 && (
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {photos.map((p) => (
                    <img
                      key={p.id}
                      src={p.photo_url}
                      alt={p.caption || 'Accommodation'}
                      className="aspect-[4/3] object-cover rounded-md"
                    />
                  ))}
                </div>
              </CardContent>
            )}
            {photos.length === 0 && (
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p>Add photos to make your profile more trustworthy for friends.</p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Availability Calendar (host only) */}
        {!isGuest && (
          <Card ref={calendarRef}>
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
        )}

        {/* Stay Requests (host) */}
        {!isGuest && (
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
              {hostBookings.length > 0 ? (
                <BookingRequests bookings={hostBookings} />
              ) : (
                <EmptyRequests />
              )}
            </CardContent>
          </Card>
        )}

        {/* My Trips (always visible) */}
        <Card>
          <CardHeader>
            <CardTitle>My Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {guestBookings.length > 0 ? (
              <MyTrips bookings={guestBookings} />
            ) : (
              <EmptyTrips />
            )}
          </CardContent>
        </Card>

        {/* Profile Completeness */}
        <ProfileCompleteness
          profile={profile}
          photos={photos}
          availabilities={availabilities}
        />
      </main>
    </div>
  )
}
