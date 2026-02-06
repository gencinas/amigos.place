import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PublicProfileClient from './public-profile-client'

interface Props {
  params: Promise<{ username: string }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  // Skip reserved routes
  const reserved = ['auth', 'dashboard', 'onboarding', 'api']
  if (reserved.includes(username)) notFound()

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: availabilities } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', profile.id)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })

  // Check if current user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  let currentProfile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    currentProfile = data
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <PublicProfileClient
      profile={profile}
      availabilities={availabilities ?? []}
      currentUser={currentProfile}
      isOwnProfile={isOwnProfile}
    />
  )
}
