import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const { data: availabilities } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', user.id)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })

  const { data: hostBookings } = await supabase
    .from('bookings')
    .select('*, guest:profiles!bookings_guest_id_fkey(*)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  const { data: guestBookings } = await supabase
    .from('bookings')
    .select('*, host:profiles!bookings_host_id_fkey(*)')
    .eq('guest_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      profile={profile}
      availabilities={availabilities ?? []}
      hostBookings={hostBookings ?? []}
      guestBookings={guestBookings ?? []}
    />
  )
}
